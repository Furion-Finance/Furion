// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

interface IFurionSwapFactory {

    event PairCreated(
        address indexed token0,
        address indexed token1,
        address pair,
        uint allPairsLength
    );

    function getPair(address _token0, address _token1)
        external
        view
        returns (address);

    function isFurionPairs(address _token0, address _token1)
        external
        view
        returns (bool);

    function createPair(address _token0, address _token1) external returns (address _pair);

    function allPairs(uint) external view returns (address _pair);
    function allPairsLength() external view returns (uint);

    function incomeMaker() external view returns (address);

    function incomeMakerProportion() external view returns (uint256);
}
