// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../furion-swap/interfaces/IFurionSwapFactory.sol";
import "../furion-swap/interfaces/IFurionSwapPair.sol";
import "../furion-swap/interfaces/IFurionSwapV2Router.sol";

/*
//===================================//
 ______ _   _______ _____ _____ _   _ 
 |  ___| | | | ___ \_   _|  _  | \ | |
 | |_  | | | | |_/ / | | | | | |  \| |
 |  _| | | | |    /  | | | | | | . ` |
 | |   | |_| | |\ \ _| |_\ \_/ / |\  |
 \_|    \___/\_| \_|\___/ \___/\_| \_/
//===================================//
* /

/**
 * @title Furion Income Maker Contract
 * @dev This contract will receive the transaction fee from swap pool
 *      All tx fees will be converted into FUR firstly, then transfer to income maker vault
 */
contract IncomeMaker is OwnableUpgradeable {
    using SafeERC20 for IERC20;

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Constants **************************************** //
    // ---------------------------------------------------------------------------------------- //

    uint public constant uint_MAX = type(uint).max;
    uint public constant PRICE_SCALE = 1e6;

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Variables **************************************** //
    // ---------------------------------------------------------------------------------------- //

    IFurionSwapV2Router public router;

    IFurionSwapFactory public factory;

    address public incomeSharingVault;

    // all income would be converted to one uniform token, default by FUR
    address public incomeToken;

    // ---------------------------------------------------------------------------------------- //
    // *************************************** Events ***************************************** //
    // ---------------------------------------------------------------------------------------- //
    event IncomeTokenChanged(
        address oldToken,
        address newToken
    );

    event IncomeToToken(
        address otherTokenAddress,
        address incomeTokenAddress,
        uint amountIn,
        uint amountOut
    );

    event EmergencyWithdraw(address token, uint amount);

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Constructor ************************************** //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Initialize function
     * @param _incomeToken Address of income token, default by FUR
     * @param _router Address of the FurionSwap router
     * @param _factory Address of the FurionSwap factory
     * @param _vault Address of the income sharing vault
     */
    function initialize(
        address _incomeToken,
        address _router,
        address _factory,
        address _vault
    ) public initializer {
        __Ownable_init();

        incomeToken = _incomeToken;
        router = IFurionSwapV2Router(_router);
        factory = IFurionSwapFactory(_factory);

        incomeSharingVault = _vault;
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************ Main Functions ************************************ //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Collect income from furion swap, turn token into incomeToken, and transfer to the incomeSharingVault
     * @param _tokenA Address of tokenA for trading pair
     * @param _tokenB Address of tokenB for trading pair
     * @return amountIncome Amount of income collected
     */
    function collectIncomeFromSwap(address _tokenA, address _tokenB)
    external returns (uint amountIncome){
        // Get the pair
        IFurionSwapPair pair = IFurionSwapPair(
            factory.getPair(_tokenA, _tokenB));
        require(address(pair) != address(0), "INCOME_MAKER: PAIR_NOT_EXIST");

        (address token0, address token1) = _tokenA < _tokenB
            ? (_tokenA, _tokenB)
            : (_tokenB, _tokenA);

        // Transfer lp token to the pool and get two tokens
        IERC20(address(pair)).safeTransfer(
            address(pair),
            pair.balanceOf(address(this))
        );

        // Directly call the pair to burn lp tokens
        (uint amount0, uint amount1) = pair.burn(address(this));

        uint amountIncome0 = _convertIncome(token0, amount0);
        uint amountIncome1 = _convertIncome(token1, amount1);

        amountIncome = amountIncome0 + amountIncome1;
    }

    /**
     * @notice Emergency withdraw by the owner
     * @param _token Address of the token
     * @param _amount Amount of the token
     */
    function emergencyWithdraw(address _token, uint _amount)
        external
        onlyOwner
    {
        IERC20(_token).safeTransfer(msg.sender, _amount);
        emit EmergencyWithdraw(_token, _amount);
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************ Set Functions ************************************* //
    // ---------------------------------------------------------------------------------------- //

    function setIncomeToken(address _newIncomeToken) external onlyOwner {
        require(_newIncomeToken != address(0), "INCOME_MAKER: ZERO_ADDRESS");
        incomeToken = _newIncomeToken;
        emit IncomeTokenChanged(incomeToken, _newIncomeToken);
    }

    // ---------------------------------------------------------------------------------------- //
    // *********************************** Internal Functions ********************************* //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Convert the income to incomeToken and transfer to the incomeSharingVault
     * @param _otherToken Address of the other token
     */
    function _convertIncome(address _otherToken, uint _amountToken) internal returns (uint amountIncome){
        if(_otherToken != incomeToken){
            // Get the pair
            IFurionSwapPair pair = IFurionSwapPair(factory.getPair(_otherToken, incomeToken));
            require(address(pair) != address(0), "INCOME_MAKER: PAIR_NOT_EXIST");

            amountIncome = _swap(
                _otherToken,
                _amountToken,
                address(this)
            );

            emit IncomeToToken(_otherToken, incomeToken, _amountToken, amountIncome);
        }
        
        // Transfer all incomeTokens to income sharing vault
        IERC20(incomeToken).safeTransfer(
            incomeSharingVault,
            IERC20(incomeToken).balanceOf(address(this))
        );
    }

    /**
     * @notice Swap other tokens to incomeToken
     * @param _otherToken Address of other token
     * @param _amount Amount of other token
     * @param _to Address of the receiver
     */
    function _swap(
        address _otherToken,
        uint _amount,
        address _to
    ) internal returns (uint amountOut) {
        // Get the pair
        IFurionSwapPair pair = IFurionSwapPair(
            factory.getPair(_otherToken, incomeToken)
        );
        require(address(pair) != address(0), "INCOME_MAKER: PAIR_NOT_EXIST");

        (uint reserve0, uint reserve1) = pair.getReserves();

        (uint reserveIn, uint reserveOut) = _otherToken < incomeToken
            ? (reserve0, reserve1)
            : (reserve1, reserve0);

        uint feeRate = pair.feeRate();

        // Calculate amountIn - fee
        uint amountInWithFee = _amount * (1000 - feeRate);

        // Calculate amountOut
        amountOut =
            (amountInWithFee * reserveOut) /
            (reserveIn * 1000 + amountInWithFee);

        // Transfer other token and swap
        IERC20(_otherToken).safeTransfer(address(pair), _amount);

        (uint amount0Out, uint amount1Out) = _otherToken < incomeToken
            ? (uint(0), amountOut)
            : (amountOut, uint(0));
        pair.swap(amount0Out, amount1Out, _to);
    }
}
