// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IRootPool {
    function factory() external view returns (address);

    function owner() external view returns (address);

    function changeOwner(address _newOwner) external;
}
