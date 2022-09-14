// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IAggregatePool {
    function factory() external view returns (address);

    function owner() external view returns (address);

    function changeOwner(address _newOwner) external;

    function setFur(address _newFur) external;

    function stake(
        address _tokenAddress,
        uint256 _amount,
        uint256 _price
    ) external;

    function unstake(
        address _tokenAddress,
        uint256 _amount,
        uint256 _price
    ) external;
}
