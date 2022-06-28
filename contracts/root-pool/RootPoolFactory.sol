// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../tokens/FurionFungibleToken.sol";
import "./RootPool.sol";
import "./interfaces/IRootPool.sol";
import "./interfaces/IRootPoolFactory.sol";
import "../project-pool/interfaces/IProjectPoolFactory.sol";
import "../tokens/interfaces/IFFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RootPoolFactory is IRootPoolFactory, Ownable {
    using Counters for Counters.Counter;

    IProjectPoolFactory PPF;

    address public fft;
    address public fur;
    address public oracle;

    // Starts from 1
    Counters.Counter private poolId;
    // Pool ID to pool address
    mapping(uint256 => address) public getPool;

    // No use for now
    // address[] public allPools;

    event PoolCreated(address poolAddress, uint256 id);

    constructor(
        address _fur,
        address _oracle,
        address _ppFactory
    ) {
        bytes32 _salt = keccak256(abi.encodePacked("FurionFungibleToken"));
        address fftAddress = address(
            new FurionFungibleToken{salt: _salt}(address(this))
        );

        fft = fftAddress;
        fur = _fur;
        oracle = _oracle;
        PPF = IProjectPoolFactory(_ppFactory);
    }

    /**
     * @dev Get total number of root pools in existence
     */
    function allPoolsLength() external view returns (uint256) {
        return poolId.current();
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

        // ID starts from 1
        for (uint256 i = 1; i <= poolId.current(); ) {
            IRootPool(getPool[i]).changeOwner(_newOwner);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Initialize root pool and grant FFT minting and burning permissions
     *
     * @param _nftAddress Addresses of nfts to be included in pool
     */
    function createPool(address[] memory _nftAddress) external {
        poolId.increment();

        address[] memory tokens = _getTokenAddress(_nftAddress);

        bytes32 _salt = keccak256(abi.encodePacked(tokens));
        address poolAddress = address(
            new RootPool{salt: _salt}(fft, fur, oracle, owner(), tokens)
        );

        getPool[poolId.current()] = poolAddress;
        // allPools.push(poolAddress);

        // Register pool to FFT contract for minting and burning
        IFFT(fft).addRootPool(poolAddress);

        emit PoolCreated(poolAddress, poolId.current());
    }

    /**
     * @dev Check if NFT is supported and retrieve corresponding pool token address
     */
    function _getTokenAddress(address[] memory _nftAddress)
        private
        view
        returns (address[] memory tokens)
    {
        tokens = new address[](_nftAddress.length);

        for (uint256 i = 0; i < _nftAddress.length; ) {
            address tokenAddress = PPF.getPool(_nftAddress[i]);
            require(tokenAddress != address(0), "RootPool: NFT not supported");

            tokens[i] = _nftAddress[i];

            unchecked {
                ++i;
            }
        }

        return tokens;
    }
}
