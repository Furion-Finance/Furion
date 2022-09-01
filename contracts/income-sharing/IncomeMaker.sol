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

    uint256 public constant uint_MAX = type(uint256).max;
    uint256 public constant PRICE_SCALE = 1e6;

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Variables **************************************** //
    // ---------------------------------------------------------------------------------------- //

    IFurionSwapV2Router public router;

    IFurionSwapFactory public factory;

    address public incomeSharingVault;

    // all income would be converted to one uniform token, default by FUR
    address public incomeToken;

    // proportion allocated to income sharing vault, 0-100, 80 by default
    uint256 public incomeProportion;

    // ---------------------------------------------------------------------------------------- //
    // *************************************** Events ***************************************** //
    // ---------------------------------------------------------------------------------------- //
    event IncomeTokenChanged(address oldToken, address newToken);
    event IncomeProportionChanged(uint256 oldProportion, uint256 newProportion);

    event IncomeToToken(
        address otherTokenAddress,
        address incomeTokenAddress,
        uint256 amountIn,
        uint256 amountOut
    );

    event EmergencyWithdraw(address token, uint256 amount);

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

        incomeProportion = 80; // default by 80
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
        external
        returns (uint256 amountIncome)
    {
        // Get the pair
        IFurionSwapPair pair = IFurionSwapPair(
            factory.getPair(_tokenA, _tokenB)
        );
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
        (uint256 amount0, uint256 amount1) = pair.burn(address(this));

        uint256 amountIncome0 = _convertIncome(token0, amount0);
        uint256 amountIncome1 = _convertIncome(token1, amount1);

        amountIncome = amountIncome0 + amountIncome1;

        // Transfer all incomeTokens to income sharing vault
        IERC20(incomeToken).safeTransfer(
            incomeSharingVault,
            (IERC20(incomeToken).balanceOf(address(this)) * incomeProportion) /
                100
        );
    }

    /**
     * @notice Emergency withdraw by the owner
     * @param _token Address of the token
     * @param _amount Amount of the token
     */
    function emergencyWithdraw(address _token, uint256 _amount)
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
        emit IncomeTokenChanged(incomeToken, _newIncomeToken);

        incomeToken = _newIncomeToken;
    }

    function setIncomeProportion(uint8 _newIncomeProportion)
        external
        onlyOwner
    {
        require(
            _newIncomeProportion <= 100,
            "INCOME_MAKER: EXCEED_PROPORTION_RANGE"
        );
        emit IncomeProportionChanged(incomeProportion, _newIncomeProportion);

        incomeProportion = _newIncomeProportion;
    }

    // ---------------------------------------------------------------------------------------- //
    // *********************************** Internal Functions ********************************* //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Convert the income to incomeToken and transfer to the incomeSharingVault
     * @param _otherToken Address of the other token
     */
    function _convertIncome(address _otherToken, uint256 _amountToken)
        internal
        returns (uint256 amountIncome)
    {
        if (_otherToken != incomeToken) {
            // Get the pair
            IFurionSwapPair pair = IFurionSwapPair(
                factory.getPair(_otherToken, incomeToken)
            );
            require(
                address(pair) != address(0),
                "INCOME_MAKER: PAIR_NOT_EXIST"
            );

            amountIncome = _swap(_otherToken, _amountToken, address(this));

            emit IncomeToToken(
                _otherToken,
                incomeToken,
                _amountToken,
                amountIncome
            );
        }
    }

    /**
     * @notice Swap other tokens to incomeToken
     * @param _otherToken Address of other token
     * @param _amount Amount of other token
     * @param _to Address of the receiver
     */
    function _swap(
        address _otherToken,
        uint256 _amount,
        address _to
    ) internal returns (uint256 amountOut) {
        // Get the pair
        IFurionSwapPair pair = IFurionSwapPair(
            factory.getPair(_otherToken, incomeToken)
        );
        require(address(pair) != address(0), "INCOME_MAKER: PAIR_NOT_EXIST");

        (uint256 reserve0, uint256 reserve1) = pair.getReserves();

        (uint256 reserveIn, uint256 reserveOut) = _otherToken < incomeToken
            ? (reserve0, reserve1)
            : (reserve1, reserve0);

        uint256 feeRate = pair.feeRate();

        // Calculate amountIn - fee
        uint256 amountInWithFee = _amount * (1000 - feeRate);

        // Calculate amountOut
        amountOut =
            (amountInWithFee * reserveOut) /
            (reserveIn * 1000 + amountInWithFee);

        // Transfer other token and swap
        IERC20(_otherToken).safeTransfer(address(pair), _amount);

        (uint256 amount0Out, uint256 amount1Out) = _otherToken < incomeToken
            ? (uint256(0), amountOut)
            : (amountOut, uint256(0));
        pair.swap(amount0Out, amount1Out, _to);
    }
}
