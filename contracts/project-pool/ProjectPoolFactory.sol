// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ProjectPool.sol";
import "./interfaces/IProjectPool.sol";
import "./interfaces/IProjectPoolFactory.sol";
import "../IChecker.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProjectPoolFactory is IProjectPoolFactory, Ownable {
    // NFT address to pool address
    mapping(address => address) public getPool;
    // Get NFT address for getting reference price from oracle
    // Pool address to NFT address
    mapping(address => address) public getNft;

    address public checker;
    address[] public allPools;

    // Record of all nft addresses for root pool
    // address[] public allNfts;

    event PoolCreated(
        address nftAddress,
        address poolAddress,
        uint256 poolIndex
    );

    constructor(address _checker) {
        checker = _checker;
    }

    /**
     * @dev Get total number of pools
     */
    function allPoolsLength() external view returns (uint256 totalPools) {
        totalPools = allPools.length;
        return totalPools;
    }

    /**
     * @dev Change owner/fee receiver for all project pools
     */
    function transferOwnership(address _newOwner) public override onlyOwner {
        require(
            _newOwner != address(0),
            "Ownable: New owner is the zero address"
        );

        _transferOwnership(_newOwner);

        for (uint256 i = 0; i < allPools.length; ) {
            IProjectPool(allPools[i]).changeOwner(_newOwner);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Create pool and add address to array
     */
    function createPool(address _nftAddress)
        external
        returns (address poolAddress)
    {
        require(checker != address(0), "ProjectPoolFactory: Checker not set.");
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
        poolAddress = address(
            new ProjectPool{salt: _salt}(
                _nftAddress,
                owner(),
                tokenName,
                tokenSymbol
            )
        );

        getPool[_nftAddress] = poolAddress;
        getNft[poolAddress] = _nftAddress;
        //allPools.push(poolAddress);
        IChecker(checker).addToken(poolAddress);

        emit PoolCreated(_nftAddress, poolAddress, allPools.length);
    }

    /**
     * @dev Get NFT name and symbol for token metadata
     */
    function _tokenMetadata(address _nftAddress)
        private
        view
        returns (string memory tokenName, string memory tokenSymbol)
    {
        string memory nftName = IERC721Metadata(_nftAddress).name();
        string memory nftSymbol = IERC721Metadata(_nftAddress).symbol();
        tokenName = string.concat("Furion ", nftName);
        tokenSymbol = string.concat("F-", nftSymbol);

        return (tokenName, tokenSymbol);
    }
}
