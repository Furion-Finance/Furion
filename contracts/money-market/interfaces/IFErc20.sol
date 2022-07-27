// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IFErc20 {
    function supply(uint256 _mintAmount) external;

    function redeem(uint256 _redeemTokens) external;

    function redeemUnderlying(uint256 _redeemAmount) external;

    function borrow(uint256 _borrowAmount) external;

    function repayBorrow(uint256 _repayAmount) external;

    function repayBorrowBehalf(address _borrower, uint256 _repayAmount)
        external;

    function liquidateBorrow(
        address _borrower,
        uint256 _repayAmount,
        address _fTokenCollateral
    ) external;

    //function sweepToken(address _token) external;
}
