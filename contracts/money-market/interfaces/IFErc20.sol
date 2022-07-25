// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IFErc20 {
    function mint(uint256 mintAmount) external virtual returns (uint256);

    function redeem(uint256 redeemTokens) external virtual returns (uint256);

    function redeemUnderlying(uint256 redeemAmount)
        external
        virtual
        returns (uint256);

    function borrow(uint256 borrowAmount) external virtual returns (uint256);

    function repayBorrow(uint256 repayAmount)
        external
        virtual
        returns (uint256);

    function repayBorrowBehalf(address borrower, uint256 repayAmount)
        external
        virtual
        returns (uint256);

    function liquidateBorrow(
        address borrower,
        uint256 repayAmount,
        CTokenInterface cTokenCollateral
    ) external virtual returns (uint256);

    function sweepToken(EIP20NonStandardInterface token) external virtual;
}
