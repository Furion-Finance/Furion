// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IInterestRateModel {
    function getBorrowRate(uint256 _cash, uint256 _borrows)
        external
        view
        returns (uint256);

    function getSupplyRate(uint256 _cash, uint256 _borrows)
        external
        view
        returns (uint256);
}
