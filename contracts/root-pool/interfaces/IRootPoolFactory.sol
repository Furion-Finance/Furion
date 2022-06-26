// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IRootPoolFactory {
    function getPool(address _nftAddress) external view returns (address);

    function allPools(uint256 _index) external view returns (address);

    function FFT() external view returns (address);

    function oracle() external view returns (address);

    function allPoolsLength() external view returns (uint256 totalPools);
}
