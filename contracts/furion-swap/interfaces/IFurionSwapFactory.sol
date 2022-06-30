// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

interface IFurionSwapFactory {

    function getPair(address _token0, address _token1)
        external
        view
        returns (address);

    function isFurionPairs(address _token0, address _token1)
        external
        view
        returns (bool);

    function createPair(address _token0, address _token1, uint256 _deadline,
        uint256 _feeRate) external returns (address _pair);

    function allPairs(uint) external view returns (address _pair);
    function allPairsLength() external view returns (uint);

    function incomeMaker() external view returns (address);

    function incomeMakerProportion() external view returns (uint256);
}
