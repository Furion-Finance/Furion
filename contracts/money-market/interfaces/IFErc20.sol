// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IFErc20 {
    function mint(uint256 _mintAmount) external virtual returns (uint256);

    function redeem(uint256 _redeemTokens) external virtual returns (uint256);

    function redeemUnderlying(uint256 _redeemAmount)
        external
        virtual
        returns (uint256);

    function borrow(uint256 _borrowAmount) external virtual returns (uint256);

    function repayBorrow(uint256 _repayAmount)
        external
        virtual
        returns (uint256);

    function repayBorrowBehalf(address _borrower, uint256 _repayAmount)
        external
        virtual
        returns (uint256);

    function liquidateBorrow(
        address _borrower,
        uint256 _repayAmount,
        address _fTokenCollateral
    ) external virtual returns (uint256);

    function sweepToken(address _token) external virtual;
}
