// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ISeparatePoolFactory {
    function numOfPools() external view returns (uint256 totalPools);

    function getAllNfts() external view returns (address[] memory nftsWithPool);

    function getAllPools()
        external
        view
        returns (address[] memory poolAddresses);

    function getNftByPool(address _poolAddress) external view returns (address);

    function createPool(address _nftAddress)
        external
        returns (address poolAddress);
}
