// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "./interfaces/IFurionSwapFactory.sol";
import ".FurionSwapPair.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/*
//===================================//
 ______ _   _______ _____ _____ _   _ 
 |  ___| | | | ___ \_   _|  _  | \ | |
 | |_  | | | | |_/ / | | | | | |  \| |
 |  _| | | | |    /  | | | | | | . ` |
 | |   | |_| | |\ \ _| |_\ \_/ / |\  |
 \_|    \___/\_| \_|\___/ \___/\_| \_/
//===================================//
* /

/**
 * @title Furion Swap Factory
 * @dev Factory contract to deploy new trading pair
 *      All token pairs are supported but with an indicator to show if one of them is Furion Tokens
 *      Furion Tokens refer to F-* token, FFT, and FUR
 */


contract FurionSwapFactory {
    // ---------------------------------------------------------------------------------------- //
    // ************************************* Variables **************************************** //
    // ---------------------------------------------------------------------------------------- //

    // token0 Address => token1 Address => Pool Address
    mapping(address => mapping(address => address)) override getPair;
    mapping(address => mapping(address => bool)) override isFurionPairs;


    // Store all the pairs' addresses
    address[] public allPairs;

    // Address of income maker, part of the transaction fee will be distributed to this address
    address public incomeMaker;

    // Swap fee proportion to income maker
    uint256 public incomeMakerProportion;

    // ---------------------------------------------------------------------------------------- //
    // *************************************** Events ***************************************** //
    // ---------------------------------------------------------------------------------------- //

    event PairCreated(
        address indexed token0,
        address indexed token1,
        address pair,
        uint allPairsLength
    );
    event IncomeMakerProportionChanged(
        uint256 oldProportion,
        uint256 newProportion
    );
    event IncomeMakerAddressChanged(
        address oldIncomeMaker,
        address newIncomeMaker
    );

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Constructor ************************************** //
    // ---------------------------------------------------------------------------------------- //

    constructor(address _incomeMaker) public {
        incomeMaker = _incomeMaker;
        // 1% of swap fee is distributed to income maker contract
        // Can be set later
        incomeMakerProportion = 1;
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************ View Functions ************************************ //
    // ---------------------------------------------------------------------------------------- //

    function allPairsLength() external override view returns (uint) {
        return allPairs.length;
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Set Functions ************************************ //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Set income maker proportion
     * @dev    Only callable by the owner
     * @param _proportion New proportion to income maker contract
     */
    function setIncomeMakerProportion(uint256 _proportion) external onlyOwner {
        emit IncomeMakerProportionChanged(incomeMakerProportion, _proportion);
        incomeMakerProportion = _proportion;
    }

    /**
     * @notice Set income maker address
     * @dev Only callable by the owner
     * @param _incomeMaker New income maker address
     */
    function setIncomeMakerAddress(address _incomeMaker) external onlyOwner {
        emit IncomeMakerAddressChanged(incomeMaker, _incomeMaker);
        incomeMaker = _incomeMaker;
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Main Functions *********************************** //
    // ---------------------------------------------------------------------------------------- //

    function createPair(address _tokenA, address _tokenB) external override returns (address _pair) {

        require(_tokenA != _tokenB, "FurionSwap: IDENTICAL_ADDRESSES");

        (address token0, address token1) = _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA);

        require(token0 != address(0), "FurionSwap: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "UniswapV2: PAIR_EXISTS"); // single check is sufficient

        bytes memory bytecode = type(FurionSwapPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        FurionSwapPair(pair).initialize(token0, token1);

        // populate mapping in the reverse direction
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;

        allPairs.push(pair);

        emit PairCreated(token0, token1, pair, allPairs.length);
    }
}
