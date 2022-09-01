// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./TokenBase.sol";

contract FEther is TokenBase {
    function initialize(
        address _riskManager,
        address _interestRateModel,
        address _priceOracle,
        address _checker
    ) public initializer {
        __TokenBase_init(
            _riskManager,
            _interestRateModel,
            _priceOracle,
            _checker,
            "Furion Ether",
            "fETH"
        );
    }

    /**
     * @notice Sender supplies ETH into the market and receives fETH in exchange
     * @dev Reverts upon any failure
     */
    function supply() external payable {
        // Params: supplier, supply amount
        supplyInternal(msg.sender, msg.value);
    }

    /**
     * @notice Sender redeems fETH in exchange for ETH.
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param _redeemTokens The number of fETH to redeem into underlying
     */
    function redeem(uint256 _redeemTokens) external {
        // Params: redeemer, tokens supplied for redemption, amount of underlying to receive
        redeemInternal(msg.sender, _redeemTokens, 0);
    }

    /**
     * @notice Sender redeems fETH in exchange for a specified amount of ETH.
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param _redeemAmount The amount of ETH to redeem
     */
    function redeemUnderlying(uint256 _redeemAmount) external {
        // Params: redeemer, tokens supplied for redemption, amount of underlying to receive
        redeemInternal(msg.sender, 0, _redeemAmount);
    }

    /**
     * @notice Sender borrows ETH from the protocol to their own address
     * @param _borrowAmount The amount of ETH to borrow
     */
    function borrow(uint256 _borrowAmount) external {
        // Params: borrower, borrow amount
        borrowInternal(msg.sender, _borrowAmount);
    }

    /**
     * @notice Sender repays their own borrow
     * @dev Reverts upon any failure
     */
    function repayBorrow() external payable {
        // Params: payer, borrower, repay amount
        repayBorrowInternal(msg.sender, msg.sender, msg.value);
    }

    /**
     * @notice Sender repays a borrow belonging to borrower
     * @dev Reverts upon any failure
     * @param _borrower the account with the debt being payed off
     */
    function repayBorrowBehalf(address _borrower) external payable {
        // Params: payer, borrower, repay amount
        repayBorrowInternal(msg.sender, _borrower, msg.value);
    }

    function liquidateBorrow(address _borrower, address _fTokenCollateral)
        external
        payable
    {
        liquidateBorrowInternal(
            msg.sender,
            _borrower,
            msg.value,
            _fTokenCollateral
        );
    }

    /******************************* Safe Token *******************************/

    function doTransferIn(address _from, uint256 _amount) internal override {
        require(msg.sender == _from, "FEther: Not owner of account");
        require(msg.value == _amount, "FEther: Not enough ETH supplied");

        totalCash += _amount;
    }

    function doTransferOut(address payable _to, uint256 _amount)
        internal
        override
    {
        _to.transfer(_amount);

        totalCash -= _amount;
    }
}
