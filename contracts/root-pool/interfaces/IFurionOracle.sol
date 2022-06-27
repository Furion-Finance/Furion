// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IFurionOracle {
    function getNFTPrice(address _token, uint256 _id)
        external
        view
        returns (uint256 price);
}
