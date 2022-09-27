// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "../utils/SafeERC20.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IFurionToken} from "../tokens/interfaces/IFurionToken.sol";
import {Math} from "../libraries/Math.sol";

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
 * @title  Farming Pool
 * @notice This contract is for LPToken mining on Furion
 * @dev    The pool id starts from 1 rather than 0
 *         The Furion reward is calculated by timestamp rather than block number
 *         This is one upgradeable version
 */

contract FarmingPoolUpgradeable is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    using SafeERC20 for IERC20;
    using SafeERC20 for IFurionToken;
    using Math for uint256;

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Variables **************************************** //
    // ---------------------------------------------------------------------------------------- //

    string public constant name = "Furion LP Farming Pool";

    // The reward token is Furion
    IFurionToken public furion;

    // SCALE/Precision used for calculating rewards
    uint256 public constant SCALE = 1e12;

    // PoolId starts from 1
    uint256 public _nextPoolId;

    // Farming starts from a certain block timestamp
    uint256 public startTimestamp;

    struct PoolInfo {
        address lpToken; // LPToken address
        uint256 basicFurionPerSecond; // Basic Reward speed
        uint256 lastRewardTimestamp; // Last reward timestamp
        uint256 accFurionPerShare; // Accumulated Furion per share
    }
    PoolInfo[] public poolList;

    // lptoken address => poolId
    mapping(address => uint256) public poolMapping;

    // poolId => is farming or not
    mapping(uint256 => bool) public isFarming;

    struct UserInfo {
        uint256 rewardDebt; // Furion reward debt
        uint256 stakingBalance; // the amount of a user's staking in the pool
    }

    // poolId => userAddress => userInfo
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    // ---------------------------------------------------------------------------------------- //
    // *************************************** Events ***************************************** //
    // ---------------------------------------------------------------------------------------- //

    event StartTimestampChanged(uint256 startTimestamp);
    event Stake(address staker, uint256 poolId, uint256 amount);
    event Withdraw(address staker, uint256 poolId, uint256 amount);
    event Harvest(
        address staker,
        address rewardReceiver,
        uint256 poolId,
        uint256 pendingReward
    );

    event NewPoolAdded(address lpToken, uint256 basicFurionPerSecond);
    event FarmingPoolStarted(uint256 poolId, uint256 timestamp);
    event FarmingPoolStopped(uint256 poolId, uint256 timestamp);
    event FurionRewardChanged(uint256 poolId, uint256 basicFurionPerSecond);
    event PoolUpdated(uint256 poolId, uint256 accFurionPerShare);

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Constructor ************************************** //
    // ---------------------------------------------------------------------------------------- //

    function initialize(address _furion) public initializer {
        require(_furion != address(0), "FARMING_POOL: ZERO_ADDRESS");

        __Ownable_init();
        __ReentrancyGuard_init_unchained();
        __Pausable_init_unchained();

        furion = IFurionToken(_furion);

        // Start from 1
        _nextPoolId = 1;

        poolList.push(
            PoolInfo({
                lpToken: address(0),
                basicFurionPerSecond: 0,
                lastRewardTimestamp: 0,
                accFurionPerShare: 0
            })
        );
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************** Modifiers *************************************** //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice The address can not be zero
     */
    modifier notZeroAddress(address _address) {
        require(_address != address(0), "FARMING_POOL: ZERO_ADDRESS");
        _;
    }

    /**
     * @notice The pool is still in farming
     */
    modifier stillFarming(uint256 _poolId) {
        require(isFarming[_poolId], "FARMING_POOL: POOL_NOT_FARMING");
        _;
    }

    // ---------------------------------------------------------------------------------------- //
    // *********************************** Main Functions ************************************* //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Add a new lp into the pool
     * @dev Can only be called by the owner
     *      The reward speed can be 0 and set later by setFurionReward function
     * @param _lpToken LP token address
     * @param _basicFurionPerSecond Basic reward speed(per second) for this new pool
     * @param _withUpdate Whether update all pools' status
     */
    function add(
        address _lpToken,
        uint256 _basicFurionPerSecond,
        bool _withUpdate
    ) public notZeroAddress(_lpToken) onlyOwner whenNotPaused {
        // Check if already exists, if the poolId is 0, that means not in the pool
        require(!_alreadyInPool(_lpToken), "FARMING_POOL: ALREADY_IN_POOL");

        if (_withUpdate) {
            massUpdatePools();
        }

        uint256 lastRewardTimestamp = block.timestamp > startTimestamp
            ? block.timestamp
            : startTimestamp;

        // Push this new pool into the list
        poolList.push(
            PoolInfo({
                lpToken: _lpToken,
                basicFurionPerSecond: _basicFurionPerSecond,
                lastRewardTimestamp: lastRewardTimestamp,
                accFurionPerShare: 0
            })
        );

        // Store the poolId and set the farming status to true
        if (_basicFurionPerSecond > 0) isFarming[_nextPoolId] = true;

        poolMapping[_lpToken] = _nextPoolId++;

        emit NewPoolAdded(_lpToken, _basicFurionPerSecond);
    }

    /**
     * @notice Update the FurionPerSecond for a specific pool (set to 0 to stop farming)
     * @param _poolId Id of the farming pool
     * @param _basicFurionPerSecond New basic reward amount per second
     * @param _withUpdate Whether update all pools
     */
    function setFurionReward(
        uint256 _poolId,
        uint256 _basicFurionPerSecond,
        bool _withUpdate
    ) public onlyOwner whenNotPaused {
        // Ensure there already exists this pool
        require(
            poolList[_poolId].lastRewardTimestamp != 0,
            "FARMING_POOL: POOL_NOT_EXIST"
        );

        if (_withUpdate) massUpdatePools();
        else updatePool(_poolId);

        // Not farming now + reward > 0 => Restart
        if (isFarming[_poolId] == false && _basicFurionPerSecond > 0) {
            isFarming[_poolId] = true;
            emit FarmingPoolStarted(_poolId, block.timestamp);
        }

        if (_basicFurionPerSecond == 0) {
            isFarming[_poolId] = false;
            emit FarmingPoolStopped(_poolId, block.timestamp);
        } else {
            poolList[_poolId].basicFurionPerSecond = _basicFurionPerSecond;
            emit FurionRewardChanged(_poolId, _basicFurionPerSecond);
        }
    }

    /**
     * @notice Update the FurionPerSecond for a bundle of pools (used for daily updating farming rate)
     * @param _poolId Id collection of the farming pool
     * @param _basicFurionPerSecond New basic reward amount per second
     * @param _withUpdate Whether update all pools
     */
    function setFurionRewards(
        uint256[] calldata _poolId,
        uint256[] calldata _basicFurionPerSecond,
        bool _withUpdate
    ) public onlyOwner whenNotPaused {
        uint256 length = _poolId.length;
        require(length <= 9, "FARMING_POOL: MORE_THAN_NINE");

        for (uint256 i = 0; i < length; ) {
            setFurionReward(_poolId[i], _basicFurionPerSecond[i], _withUpdate);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Stake LP token into the farming pool
     * @dev Can only stake to the pools that are still farming
     * @param _poolId Id of the farming pool
     * @param _amount Staking amount
     */
    function stake(uint256 _poolId, uint256 _amount)
        public
        nonReentrant
        whenNotPaused
        stillFarming(_poolId)
    {
        require(_amount > 0, "FARMING_POOL: STAKE_ZERO");

        PoolInfo storage pool = poolList[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];

        // Must update first
        updatePool(_poolId);

        // First distribute the reward if exists
        if (user.stakingBalance > 0) {
            uint256 pending = (user.stakingBalance * pool.accFurionPerShare) /
                SCALE -
                user.rewardDebt;

            // Real reward amount
            uint256 reward = _safeFurionTransfer(msg.sender, pending);
            emit Harvest(msg.sender, msg.sender, _poolId, reward);
        }

        // Actual deposit amount
        uint256 actualAmount = _safeLPTransfer(
            false,
            pool.lpToken,
            msg.sender,
            _amount
        );

        user.stakingBalance += actualAmount;

        user.rewardDebt =
            (user.stakingBalance * pool.accFurionPerShare) /
            SCALE;

        emit Stake(msg.sender, _poolId, actualAmount);
    }

    /**
     * @notice Withdraw lptoken from the pool
     * @param _poolId Id of the farming pool
     * @param _amount Amount of lp tokens to withdraw
     */
    function withdraw(uint256 _poolId, uint256 _amount)
        public
        nonReentrant
        whenNotPaused
    {
        require(_amount > 0, "FARMING_POOL: WITHDRAW_ZERO");

        PoolInfo storage pool = poolList[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];

        require(
            user.stakingBalance >= _amount,
            "FARMING_POOL: NO_ENOUGH_STAKING_BALANCE"
        );

        // Update if the pool is still farming
        // Users can withdraw even after the pool stopped
        if (isFarming[_poolId]) updatePool(_poolId);

        uint256 pending = (user.stakingBalance * pool.accFurionPerShare) /
            SCALE -
            user.rewardDebt;

        uint256 reward = _safeFurionTransfer(msg.sender, pending);
        emit Harvest(msg.sender, msg.sender, _poolId, reward);

        uint256 actualAmount = _safeLPTransfer(
            true,
            pool.lpToken,
            msg.sender,
            _amount
        );

        user.stakingBalance -= actualAmount;

        user.rewardDebt =
            (user.stakingBalance * pool.accFurionPerShare) /
            SCALE;

        emit Withdraw(msg.sender, _poolId, actualAmount);
    }

    /**
     * @notice Harvest the Furion reward and can be sent to another address
     * @param _poolId Id of the farming pool
     * @param _to Receiver of Furion rewards
     */
    function harvest(uint256 _poolId, address _to)
        public
        nonReentrant
        whenNotPaused
    {
        // Only update the pool when it is still in farming
        if (isFarming[_poolId]) updatePool(_poolId);

        PoolInfo memory pool = poolList[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];

        uint256 pendingReward = (user.stakingBalance * pool.accFurionPerShare) /
            SCALE -
            user.rewardDebt;

        require(pendingReward > 0, "FARMING_POOL: NO_PENDING_REWARD");

        // Update the reward debt
        user.rewardDebt =
            (user.stakingBalance * pool.accFurionPerShare) /
            SCALE;

        // Transfer the reward
        uint256 reward = _safeFurionTransfer(_to, pendingReward);

        emit Harvest(msg.sender, _to, _poolId, reward);
    }

    /**
     * @notice Update the pool's reward status
     * @param _poolId Id of the farming pool
     */
    function updatePool(uint256 _poolId) public {
        PoolInfo storage pool = poolList[_poolId];
        if (block.timestamp <= pool.lastRewardTimestamp) {
            return;
        }

        uint256 lpSupply = IERC20(pool.lpToken).balanceOf(address(this));

        // No LP deposited, then just update the lastRewardTimestamp
        if (lpSupply == 0) {
            pool.lastRewardTimestamp = block.timestamp;
            return;
        }

        uint256 timePassed = block.timestamp - pool.lastRewardTimestamp;

        uint256 basicReward = timePassed * pool.basicFurionPerSecond;

        pool.accFurionPerShare += (basicReward * SCALE) / lpSupply;

        // Don't forget to set the farming pool as minter
        furion.mintFurion(address(this), basicReward);

        pool.lastRewardTimestamp = block.timestamp;

        emit PoolUpdated(_poolId, pool.accFurionPerShare);
    }

    /**
     * @notice Update all farming pools (except for those stopped ones)
     * @dev Can be called by anyone
     *      Only update those active pools
     */
    function massUpdatePools() public {
        uint256 length = poolList.length;
        for (uint256 poolId; poolId < length; poolId++) {
            if (isFarming[poolId] == false) continue;
            else updatePool(poolId);
        }
    }

    // ---------------------------------------------------------------------------------------- //
    // *********************************** View Functions ************************************* //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Check the amount of pending Furion reward
     * @param _poolId PoolId of this farming pool
     * @param _user User address
     * @return pendingFurionAmount Amount of pending Furion
     */
    function pendingFurion(uint256 _poolId, address _user)
        external
        view
        returns (uint256)
    {
        PoolInfo memory poolInfo = poolList[_poolId];

        if (
            poolInfo.lastRewardTimestamp == 0 ||
            block.timestamp < poolInfo.lastRewardTimestamp ||
            block.timestamp < startTimestamp
        ) return 0;

        UserInfo memory user = userInfo[_poolId][_user];

        // Total lp token balance
        uint256 lpBalance = IERC20(poolInfo.lpToken).balanceOf(address(this));

        // Accumulated shares to be calculated
        uint256 accFurionPerShare = poolInfo.accFurionPerShare;

        if (lpBalance == 0) return 0;
        else {
            // If the pool is still farming, update the info
            if (isFarming[_poolId]) {
                // Deigs amount given to this pool
                uint256 timePassed = block.timestamp -
                    poolInfo.lastRewardTimestamp;
                uint256 basicReward = poolInfo.basicFurionPerSecond *
                    timePassed;
                // Update accFurionPerShare
                // LPToken may have different decimals
                accFurionPerShare += (basicReward * SCALE) / lpBalance;
            }

            // If the pool has stopped, not update the info
            uint256 pending = (user.stakingBalance * accFurionPerShare) /
                SCALE -
                user.rewardDebt;

            return pending;
        }
    }

    /**
     * @notice Get the total pool list
     * @return pooList Total pool list
     */
    function getPoolList() external view returns (PoolInfo[] memory) {
        return poolList;
    }

    /**
     * @notice Get a user's balance
     * @param _poolId Id of the pool
     * @param _user User address
     * @return balance User's balance (lpToken)
     */
    function getUserBalance(uint256 _poolId, address _user)
        external
        view
        returns (uint256)
    {
        return userInfo[_poolId][_user].stakingBalance;
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Set Functions ************************************ //
    // ---------------------------------------------------------------------------------------- //

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Set the start block timestamp
     * @param _startTimestamp New start block timestamp
     */
    function setStartTimestamp(uint256 _startTimestamp)
        external
        onlyOwner
        whenNotPaused
    {
        // Can only be set before any pool is added
        require(_nextPoolId == 1, "ALREADY_HAVING_POOLS");

        startTimestamp = _startTimestamp;
        emit StartTimestampChanged(_startTimestamp);
    }

    // ---------------------------------------------------------------------------------------- //
    // ********************************** Internal Functions ********************************** //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Check if a lptoken has been added into the pool before
     * @dev This can also be written as a modifier
     * @param _lpToken LP token address
     * @return _isInPool Wether this lp is already in pool
     */
    function _alreadyInPool(address _lpToken)
        internal
        view
        returns (bool _isInPool)
    {
        uint256 poolId = poolMapping[_lpToken];

        _isInPool = (poolId != 0) ? true : false;
    }

    /**
     * @notice Safe Furion transfer (check if the pool has enough Furion token, if not, transfer balance)
     * @param _to User's address
     * @param _amount Amount to transfer
     */
    function _safeFurionTransfer(address _to, uint256 _amount)
        internal
        returns (uint256)
    {
        uint256 poolFurionBalance = furion.balanceOf(address(this));
        require(poolFurionBalance > 0, "FARMING_POOL: NO_FUR_IN_POOL");

        if (_amount > poolFurionBalance) {
            furion.safeTransfer(_to, poolFurionBalance);
            return (poolFurionBalance);
        } else {
            furion.safeTransfer(_to, _amount);
            return _amount;
        }
    }

    /**
     * @notice Finish the transfer of LP Token
     * @dev The lp token may have loss during transfer
     * @param _out Whether the lp token is out
     * @param _lpToken LP token address
     * @param _user User address
     * @param _amount Amount of lp tokens
     */
    function _safeLPTransfer(
        bool _out,
        address _lpToken,
        address _user,
        uint256 _amount
    ) internal returns (uint256) {
        uint256 poolBalanceBefore = IERC20(_lpToken).balanceOf(address(this));

        if (_out) IERC20(_lpToken).safeTransfer(_user, _amount);
        else IERC20(_lpToken).safeTransferFrom(_user, address(this), _amount);

        uint256 poolBalanceAfter = IERC20(_lpToken).balanceOf(address(this));

        return
            _out
                ? poolBalanceBefore - poolBalanceAfter
                : poolBalanceAfter - poolBalanceBefore;
    }
}
