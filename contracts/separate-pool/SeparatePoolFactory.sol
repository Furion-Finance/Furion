// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./SeparatePool.sol";
import "./interfaces/ISeparatePool.sol";
import "./interfaces/ISeparatePoolFactory.sol";
import "../IChecker.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SeparatePoolFactory is ISeparatePoolFactory, Ownable {
    address public immutable incomeMaker;

    // Addresses of NFTs with a pool
    address[] public allNfts;
    // NFT address to pool address
    mapping(address => address) public getPool;

    IChecker Checker;
    address public fur;

    event PoolCreated(
        address nftAddress,
        address poolAddress,
        uint256 poolIndex
    );

    constructor(
        address _incomeMaker,
        address _checker,
        address _fur
    ) {
        incomeMaker = _incomeMaker;
        Checker = IChecker(_checker);
        fur = _fur;
    }

    /**
     * @dev Get total number of NFTs with a separate pool
     */
    function numOfPools() external view returns (uint256 totalPools) {
        totalPools = allNfts.length;
    }

    /**
     * @dev Get addresses of nft collections that has a separate pool
     */
    function getAllNfts()
        external
        view
        returns (address[] memory nftsWithPool)
    {
        nftsWithPool = allNfts;
    }

    /**
     * @dev Get addresses of all separate pools
     */
    function getAllPools()
        external
        view
        returns (address[] memory poolAddresses)
    {
        for (uint256 i; i < allNfts.length; ) {
            address nftAddress = allNfts[i];
            poolAddresses[i] = getPool[nftAddress];
        }

        return poolAddresses;
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

        for (uint256 i; i < allNfts.length; ) {
            ISeparatePool(getPool[allNfts[i]]).changeOwner(_newOwner);

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
        require(
            address(Checker) != address(0),
            "SeparatePoolFactory: Checker not set."
        );
        require(_nftAddress != address(0), "SeparatePoolFactory: ZERO_ADDRESS");
        require(
            getPool[_nftAddress] == address(0),
            "SeparatePoolFactory: PAIR_EXISTS"
        );

        (string memory tokenName, string memory tokenSymbol) = _tokenMetadata(
            _nftAddress
        );

        bytes32 _salt = keccak256(abi.encodePacked(_nftAddress));

        // New way to invoke create2 without assembly, paranthesis still needed for empty constructor
        poolAddress = address(
            new SeparatePool{salt: _salt}(
                _nftAddress,
                incomeMaker,
                fur,
                owner(),
                tokenName,
                tokenSymbol
            )
        );

        allNfts.push(_nftAddress);
        getPool[_nftAddress] = poolAddress;
        Checker.addToken(poolAddress);

        emit PoolCreated(_nftAddress, poolAddress, allNfts.length);
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
