// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./TokenBase.sol";
import "./TokenStorages.sol";
import "./interfaces/IFErc20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FErc20 is TokenBase, FErc20Storage, IFErc20 {
    function initialize(
        address _underlying,
        address _riskManager,
        address _interestRateModel,
        address _priceOracle,
        string memory _name,
        string memory _symbol
    ) public initializer {
        __TokenBase_init(
            _riskManager,
            _interestRateModel,
            _priceOracle,
            _name,
            _symbol
        );

        underlying = _underlying;
    }

    function supply(uint256 _supplyAmount) external {
        // Params: supplier, supply amount
        supplyInternal(msg.sender, _supplyAmount);
    }

    function redeem(uint256 _redeemTokens) external {
        // Params: redeemer, tokens supplied for redemption, amount of underlying to receive
        redeemInternal(msg.sender, _redeemTokens, 0);
    }

    function redeemUnderlying(uint256 _redeemAmount) external {
        // Params: redeemer, tokens supplied for redemption, amount of underlying to receive
        redeemInternal(msg.sender, 0, _redeemAmount);
    }

    function borrow(uint256 _borrowAmount) external {
        // Params: borrower, borrow amount
        borrowInternal(msg.sender, _borrowAmount);
    }

    function repayBorrow(uint256 _repayAmount) external {
        // Params: payer, borrower, repay amount
        repayBorrowInternal(msg.sender, msg.sender, _repayAmount);
    }

    function repayBorrowBehalf(address _borrower, uint256 _repayAmount)
        external
    {
        // Params: payer, borrower, repay amount
        repayBorrowInternal(msg.sender, _borrower, _repayAmount);
    }

    function liquidateBorrow(
        address _borrower,
        uint256 _repayAmount,
        address _fTokenCollateral
    ) external {
        // Params: liquidator, borrower, repay amount, collateral token to be seized
        liquidateBorrowInternal(
            msg.sender,
            _borrower,
            _repayAmount,
            _fTokenCollateral
        );
    }

    /******************************* Safe Token *******************************/

    function getUnderlying() public view override returns (address) {
        return underlying;
    }

    function doTransferIn(address _from, uint256 _amount) internal override {
        IERC20 underlyingToken = IERC20(underlying);
        underlyingToken.transferFrom(_from, address(this), _amount);

        totalCash += _amount;
    }

    function doTransferOut(address payable _to, uint256 _amount)
        internal
        override
    {
        IERC20 underlyingToken = IERC20(underlying);
        underlyingToken.transfer(_to, _amount);

        totalCash -= _amount;
    }
}
