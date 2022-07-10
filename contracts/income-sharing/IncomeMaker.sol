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
 *      Then it will transfer to income maker vault
 */
contract IncomeMaker is OwnableUpgradeable {
    using SafeERC20 for IERC20;

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Constants **************************************** //
    // ---------------------------------------------------------------------------------------- //

    uint256 public constant UINT256_MAX = type(uint256).max;

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Variables **************************************** //
    // ---------------------------------------------------------------------------------------- //

    IFurionSwapV2Router public router;

    IFurionSwapFactory public factory;

    address public incomeSharingVault;

    uint256 public PRICE_SCALE = 1e6;

    // ---------------------------------------------------------------------------------------- //
    // *************************************** Events ***************************************** //
    // ---------------------------------------------------------------------------------------- //

    event IncomeToToken(
        address otherTokenAddress,
        address outputTokenAddress,
        uint256 amountOut
    );

    event ConvertIncome(
        address caller,
        address otherTokenAddress,
        address outputTokenAddress,
        uint256 otherTokenAmount, // Amount of other token by burning lp tokens
        uint256 outputTokenAmount, // Amount of outputToken by burning lp tokens
        uint256 outputTokenBackAmount // Amount of outputToken by swapping other tokens
    );
    event EmergencyWithdraw(address token, uint256 amount);

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Constructor ************************************** //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Initialize function
     * @param _router Address of the FurionSwap router
     * @param _factory Address of the FurionSwap factory
     * @param _vault Address of the income sharing vault
     */
    function initialize(
        address _router,
        address _factory,
        address _vault
    ) public initializer {
        __Ownable_init();

        router = IFurionSwapV2Router(_router);
        factory = IFurionSwapFactory(_factory);

        incomeSharingVault = _vault;
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************ Main Functions ************************************ //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Convert the income to outputToken and transfer to the incomeSharingVault
     * @param _otherToken Address of the other token
     * @param _outputToken Address of the outputcoi
     */
    function convertIncome(address _otherToken, address _outputToken) external {
        // Get the pair
        IFurionSwapPair pair = IFurionSwapPair(
            factory.getPair(_otherToken, _outputToken)
        );
        require(address(pair) != address(0), "Pair not exist");

        // Transfer lp token to the pool and get two tokens
        IERC20(address(pair)).safeTransfer(
            address(pair),
            pair.balanceOf(address(this))
        );

        // Directly call the pair to burn lp tokens
        (uint256 amount0, uint256 amount1) = pair.burn(address(this));

        // Finish swap
        uint256 amountOut = _swap(
            _otherToken,
            _outputToken,
            amount0,
            address(this)
        );

        // Transfer all outputTokens to income sharing vault
        IERC20(_outputToken).safeTransfer(
            incomeSharingVault,
            IERC20(_outputToken).balanceOf(address(this))
        );

        emit ConvertIncome(
            msg.sender,
            _otherToken,
            _outputToken,
            amount0,
            amount1,
            amountOut
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
    // *********************************** Internal Functions ********************************* //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Swap other tokens to outputTokens
     * @param _otherToken Address of other token
     * @param _outputToken Address of outputToken
     * @param _amount Amount of other token
     * @param _to Address of the receiver
     */
    function _swap(
        address _otherToken,
        address _outputToken,
        uint256 _amount,
        address _to
    ) internal returns (uint256 amountOut) {
        // Get the pair
        IFurionSwapPair pair = IFurionSwapPair(
            factory.getPair(_otherToken, _outputToken)
        );
        require(address(pair) != address(0), "Pair not exist");

        (uint256 reserve0, uint256 reserve1) = pair.getReserves();

        uint256 feeRate = pair.feeRate();

        // Calculate amountIn - fee
        uint256 amountInWithFee = _amount * (1000 - feeRate);

        // Calculate amountOut
        amountOut =
            (amountInWithFee * reserve1) /
            (reserve0 * 1000 + amountInWithFee);

        // Transfer other token and swap
        IERC20(_otherToken).safeTransfer(address(pair), _amount);
        pair.swap(0, amountOut, _to);
    }
}
