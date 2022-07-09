// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

interface IFarmingPool {

    function pendingFurion(uint256 _poolId, address _user)
        external
        returns (uint256);

    function setStartBlock(uint256 _startBlock) external;

    function add(
        address _lpToken,
        uint256 _poolId,
        bool _withUpdate
    ) external;

    function setFurionReward(
        uint256 _poolId,
        uint256 _basicFurionPerBlock,
        uint256 _bonusFurionPerBlock,
        bool _withUpdate
    ) external;

    function stake(uint256 _poolId, uint256 _amount) external;

    function withdraw(uint256 _poolId, uint256 _amount) external;

    function updatePool(uint256 _poolId) external;

    function massUpdatePools() external;

    function harvest(uint256 _poolId, address _to) external;

    function updateBonus(address _user, uint256 _newBalance) external;
}
