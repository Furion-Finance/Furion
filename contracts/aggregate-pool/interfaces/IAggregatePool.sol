// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IAggregatePool {
    function factory() external view returns (address);

    function owner() external view returns (address);

    function changeOwner(address _newOwner) external;

    function setFur(address _newFur) external;

    function store(address _collection, uint256 _id) external;

    function storeBatch(address _collection, uint256[] calldata _ids) external;

    function buy(address _collection, uint256 _id) external;

    function buyBatch(address _collection, uint256[] calldata _ids) external;

    function lock(address _collection, uint256 _id) external;

    function unlock(address _colelction, uint256 _id) external;
}
