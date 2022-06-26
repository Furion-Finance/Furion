// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../tokens/FurionFungibleToken.sol";
import "../tokens/interfaces/IFFT.sol";
import "./interfaces/IRootPoolFactory.sol";
import "./interfaces/IRootPool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RootPoolFactory is IRootPoolFactory, Ownable {
    // NFT address to pool address
    mapping(address => address) public getPool;

    address[] public allPools;
    // Record of all nft addresses for root pool
    // address[] public allNfts;

    address public FFT;
    address public oracle;

    event PoolCreated(
        address nftAddress,
        address poolAddress,
        uint256 poolIndex
    );

    constructor(address _oracle) {
        bytes32 _salt = keccak256(abi.encodePacked("FurionFungibleToken"));
        FFT = address(new FurionFungibleToken{salt: _salt}(address(this)));

        oracle = _oracle;
    }

    function allPoolsLength() external view returns (uint256 totalPools) {
        totalPools = allPools.length;
        return totalPools;
    }

    function transferOwnership(address _newOwner) public override onlyOwner {
        require(
            _newOwner != address(0),
            "Ownable: New owner is the zero address"
        );

        _transferOwnership(_newOwner);

        for (uint256 i = 0; i < allPools.length; ) {
            IRootPool(allPools[i]).changeOwner(_newOwner);

            unchecked {
                ++i;
            }
        }
    }

    /*
    function createPool(address _nftAddress) external {
        require(_nftAddress != address(0), "ProjectPoolFactory: ZERO_ADDRESS");
        require(
            getPool[_nftAddress] == address(0),
            "ProjectPoolFactory: PAIR_EXISTS"
        );

        (string memory tokenName, string memory tokenSymbol) = _tokenMetadata(
            _nftAddress
        );

        bytes32 _salt = keccak256(abi.encodePacked(_nftAddress));

        // New way to invoke create2 without assembly, paranthesis still needed for empty constructor
        address poolAddress = address(
            new ProjectPool{salt: _salt}(
                _nftAddress,
                owner(),
                tokenName,
                tokenSymbol
            )
        );

        getPool[_nftAddress] = poolAddress;
        allPools.push(poolAddress);

        emit PoolCreated(_nftAddress, poolAddress, allPools.length);
    }
    */
}
