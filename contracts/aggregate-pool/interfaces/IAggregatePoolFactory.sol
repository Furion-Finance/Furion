// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IAggregatePoolFactory {
    function oracle() external view returns (address);

    function getPool(uint256 _poolId) external view returns (address);

    //function allPools(uint256 _index) external view returns (address);

    function allPoolsLength() external view returns (uint256);

    function createPool(
        address[] memory _tokens,
        string memory _name,
        string memory _symbol
    ) external returns (address poolAddress);
}
