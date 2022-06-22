// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ProjectPool.sol";
import "./PoolToken.sol";
import "./interfaces/IProjectPool.sol";
import "./interfaces/IPoolToken.sol";
import "./interfaces/IProjectPoolFactory.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract ProjectPoolFactory is IProjectPoolFactory {
    // NFT address to pool address
    mapping(address => address) public getPool;
    // NFT address to token address
    mapping(address => address) public getToken;

    address[] public allPools;
    address[] public allTokens;

    // Record of all nft addresses for root pool
    // address[] public allNfts;

    event PoolCreated(
        address nftAddress,
        address poolAddress,
        uint256 poolIndex,
        address tokenAddress
    );
    event TokenCreated(address nftAddress, address tokenAddress);

    function allPoolsLength() external view returns (uint256 totalPools) {
        totalPools = allPools.length;
        return totalPools;
    }

    function _createPoolToken(
        address _nftAddress,
        bytes32 _salt,
        address _poolAddress
    ) internal returns (address tokenAddress) {
        require(
            getToken[_nftAddress] == address(0),
            "ProjectPoolFactory: Token already exists."
        );

        string memory nftName = IERC721Metadata(_nftAddress).name();
        string memory nftSymbol = IERC721Metadata(_nftAddress).symbol();
        string memory tokenName = string.concat("Furion ", nftName);
        string memory tokenSymbol = string.concat("F-", nftSymbol);

        // New way to invoke create2 without assembly, paranthesis still needed for empty constructor
        tokenAddress = address(new PoolToken{salt: _salt}());

        IPoolToken(tokenAddress).initialize(
            _nftAddress,
            _poolAddress,
            tokenName,
            tokenSymbol
        );
        getToken[_nftAddress] = tokenAddress;

        return tokenAddress;
    }

    function createPool(address _nftAddress)
        external
        returns (address poolAddress)
    {
        require(_nftAddress != address(0), "ProjectPoolFactory: ZERO_ADDRESS");
        require(
            getPool[_nftAddress] == address(0),
            "ProjectPoolFactory: PAIR_EXISTS"
        );

        bytes32 _salt = keccak256(abi.encodePacked(_nftAddress));

        // New way to invoke create2 without assembly, paranthesis still needed for empty constructor
        poolAddress = address(new ProjectPool{salt: _salt}());
        address tokenAddress = _createPoolToken(
            _nftAddress,
            _salt,
            poolAddress
        );

        IProjectPool(poolAddress).initialize(_nftAddress, tokenAddress);
        getPool[_nftAddress] = poolAddress;
        allPools.push(poolAddress);

        emit PoolCreated(
            _nftAddress,
            poolAddress,
            allPools.length,
            tokenAddress
        );
        return poolAddress;
    }
}
