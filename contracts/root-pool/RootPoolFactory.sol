// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../tokens/FurionFungibleToken.sol";
import "./RootPool.sol";
import "./interfaces/IRootPool.sol";
import "./interfaces/IRootPoolFactory.sol";
import "../tokens/interfaces/IFFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract RootPoolFactory is IRootPoolFactory, Ownable {
    using Counters for Counters.Counter;

    address public fft;
    address public fur;
    address public oracle;

    // Starts from 1
    Counters.Counter private poolId;
    // Pool ID to pool address
    mapping(uint256 => address) public getPool;
    mapping(bytes32 => bool) private alreadyExist;

    // No use for now
    // address[] public allPools;

    event PoolCreated(address poolAddress, uint256 id);

    constructor(
        //address _fur,
        //address _oracle,
        address _fft
    ) {
        /*
        bytes32 _salt = keccak256(abi.encodePacked("FurionFungibleToken"));
        address fftAddress = address(
            new FurionFungibleToken{salt: _salt}(address(this))
        );
        */

        fft = _fft;
        //fur = _fur;
        //oracle = _oracle;
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
     * @param _tokens Addresses of project pools to be included in the root pool
     */
    function createPool(address[] memory _tokens)
        external
        returns (address poolAddress)
    {
        poolId.increment();

        // Act as identifier for pools to ensure no duplications
        bytes32 _salt = keccak256(abi.encodePacked(_tokens));
        require(
            !alreadyExist[_salt],
            "RootPoolFactory: Root pool for these NFTs already exists."
        );
        poolAddress = address(
            new RootPool{salt: _salt}(fft, fur, oracle, owner(), _tokens)
        );

        getPool[poolId.current()] = poolAddress;
        alreadyExist[_salt] = true;
        // allPools.push(poolAddress);

        // Register pool to FFT contract for minting and burning
        IFFT(fft).addRootPool(poolAddress);

        emit PoolCreated(poolAddress, poolId.current());
    }
}
