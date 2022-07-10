// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { VeERC20Upgradeable } from "./VeERC20Upgradeable.sol";
import { Math } from "../libraries/Math.sol";

import { IFarmingPool } from "../furion-farming/interfaces/IFarmingPool.sol";

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
 * @title Vote Escrowed Furion
 * @notice The staking contract for FUR -> veFUR
 *         veFUR:
 *            - Governance
 *            - Income sharing
 *            - etc.
 *         If you stake Furion, you generate veFUR at the current `generationRate` until you reach `maxCap`
 *         If you unstake any amount of Furion, you will lose all of your veFUR tokens
 *
 *         There is also an option that you lock your FUR for the max time
 *         and get the maximum veFUR balance immediately.
 *         !! Attention !!
 *         If you stake FUR for the max time for more than once, the lockUntil timestamp will
 *         be updated to the latest one.
 */

contract VoteEscrowedFurion is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    VeERC20Upgradeable 
{
    using SafeERC20 for IERC20;

    struct UserInfo {
        // Furion staked by user
        uint256 amount;
        // time of last veFUR claim or first deposit if user has not claimed yet
        uint256 lastRelease;
        // Amount locked for max time
        uint256 amountLocked;
        // Lock until timestamp
        uint256 lockUntil;
    }

    // User info
    mapping(address => UserInfo) public users;

    // Furion token
    IERC20 public furion;

    // Max veFUR for one single staked FUR
    // Max veFUR amount = maxCap * FUR staked
    uint256 public maxCapRatio;

    // Rate of veFUR generated per second, per Furion staked
    uint256 public generationRate;

    // Calculation scale
    uint256 public constant SCALE = 1e18;

    // contract address => whether able to receive staked veFUR
    // Contract addresses are by default unable to stake Furion, they must be whitelisted
    mapping(address => bool) public whitelist;

    // account => lock amount, lock amount for specific account
    mapping(address => uint256) public locked;

    // ---------------------------------------------------------------------------------------- //
    // *************************************** Events ***************************************** //
    // ---------------------------------------------------------------------------------------- //
    event GenerationRateChanged(uint256 oldRate, uint256 newRate);
    event MaxCapRatioChanged(uint256 oldMaxCapRatio, uint256 newMaxCapRatio);
    event WhiteListAdded(address newWhiteList);
    event WhiteListRemoVEF(address oldWhiteList);

    event Deposit(address indexed user, uint256 amount);
    event DepositMaxTime(
        address indexed user,
        uint256 amount,
        uint256 lockUntil
    );
    event Withdraw(address indexed user, uint256 amount);

    event Claimed(address indexed user, uint256 amount);

    event BurnVeFUR(
        address indexed caller,
        address indexed user,
        uint256 amount
    );

    event LockVeFUR(
        address indexed caller,
        address indexed user,
        uint256 amount
    );

    event UnlockVeFUR(
        address indexed caller,
        address indexed user,
        uint256 amount
    );

    // ---------------------------------------------------------------------------------------- //
    // *************************************** Errors ***************************************** //
    // ---------------------------------------------------------------------------------------- //

    error VEF__NotWhiteListed();
    error VEF__StillLocked();
    error VEF__ZeroAddress();
    error VEF__ZeroAmount();
    error VEF__NotEnoughBalance();

    error VEF__TimeNotPassed();
    error VEF__OverLocked();

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Constructor ************************************** //
    // ---------------------------------------------------------------------------------------- //

    function initialize(address _furion)
        public
        initializer
    {
        if (_furion == address(0)) revert VEF__ZeroAddress();

        // Initialize veFUR
        __ERC20_init("Vote Escrowed Furion", "veFUR");
        __Ownable_init();
        __ReentrancyGuard_init_unchained();
        __Pausable_init_unchained();

        // Set generationRate (veFUR per sec per Furion staked)
        generationRate = 10**18;

        // Set maxCap ratio
        maxCapRatio = 100;

        // Set Furion token
        furion = IERC20(_furion);
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************** Modifiers *************************************** //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Not callable by smart contract
     * @dev Checked first by msg.sender == tx.origin
     *      Then if the contract is whitelisted, it will still pass the check
     */
    modifier notContract(address _addr) {
        if (_addr != tx.origin) {
            if (!whitelist[_addr]) revert VEF__NotWhiteListed();
        }
        _;
    }

    /**
     * @notice No locked veFUR
     * @dev Check the locked balance of a user
     */
    modifier noLocked(address _user) {
        if (locked[_user] > 0) revert VEF__StillLocked();
        _;
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************ View Functions ************************************ //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Calculate the amount of veFUR that can be claimed by user
     * @param _user User address
     * @return claimableAmount Claimable amount of the user
     */
    function claimable(address _user) public view returns (uint256) {
        if (_user == address(0)) revert VEF__ZeroAddress();

        UserInfo memory user = users[_user];

        // Seconds passed since last claim
        uint256 timePassed = block.timestamp - user.lastRelease;

        uint256 realCapRatio = _getCapRatio(_user);

        uint256 pending;

        pending = Math.wmul(user.amount, timePassed * generationRate);

        // get user's veFUR balance
        uint256 userVeFURBalance = balanceOf(_user) -
            user.amountLocked * realCapRatio;

        // user veFUR balance cannot go above user.amount * maxCap
        uint256 veFURCap = user.amount * realCapRatio;

        // first, check that user hasn't reached the max limit yet
        if (userVeFURBalance < veFURCap) {
            // then, check if pending amount will make user balance overpass maximum amount
            if (userVeFURBalance + pending > veFURCap) {
                return veFURCap - userVeFURBalance;
            } else {
                return pending;
            }
        }
        return 0;
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************ Set Functions ************************************* //
    // ---------------------------------------------------------------------------------------- //

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Add a new whitelist address
     * @dev Only callable by the owner
     * @param _account Address to add
     */
    function addWhitelist(address _account) external onlyOwner {
        whitelist[_account] = true;
        emit WhiteListAdded(_account);
    }

    /**
     * @notice Remove a new whitelist address
     * @dev Only callable by the owner
     * @param _account Address to remove
     */
    function removeWhitelist(address _account) external onlyOwner {
        whitelist[_account] = false;
        emit WhiteListRemoVEF(_account);
    }

    /**
     * @notice Set maxCap ratio
     * @param _maxCapRatio the new max ratio
     */
    function setMaxCapRatio(uint256 _maxCapRatio) external onlyOwner {
        if (_maxCapRatio == 0) revert VEF__ZeroAmount();
        emit MaxCapRatioChanged(maxCapRatio, _maxCapRatio);
        maxCapRatio = _maxCapRatio;
    }

    /**
     * @notice Set generationRate
     * @param _generationRate New generation rate
     */
    function setGenerationRate(uint256 _generationRate) external onlyOwner {
        if (_generationRate == 0) revert VEF__ZeroAmount();
        emit GenerationRateChanged(generationRate, _generationRate);
        generationRate = _generationRate;
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************ Main Functions ************************************ //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Depisit Furion for veFUR
     * @dev Only EOA or whitelisted contract address
     * @param _amount Amount to deposit
     */
    function deposit(uint256 _amount)
        external
        nonReentrant
        whenNotPaused
        notContract(msg.sender)
    {
        if (_amount == 0) revert VEF__ZeroAmount();

        if (users[msg.sender].amount > 0) {
            // If the user has amount deposited, claim veFUR
            _claim(msg.sender);

            // Update the amount
            users[msg.sender].amount += _amount;
        } else {
            // add new user to mapping
            users[msg.sender].lastRelease = block.timestamp;
            users[msg.sender].amount = _amount;
        }

        // Request Furion from user
        furion.safeTransferFrom(msg.sender, address(this), _amount);

        emit Deposit(msg.sender, _amount);
    }

    /**
     * @notice Deposit for the max time
     * @dev Release the max amount one time
     */
    function depositMaxTime(uint256 _amount)
        external
        nonReentrant
        whenNotPaused
    {
        if (_amount == 0) revert VEF__ZeroAmount();

        uint256 currentMaxTime = (maxCapRatio * SCALE) / generationRate;
        uint256 lockUntil = block.timestamp + currentMaxTime * 2;

        users[msg.sender].amountLocked += _amount;
        users[msg.sender].lockUntil = lockUntil;

        // Request Furion from user
        furion.safeTransferFrom(msg.sender, address(this), _amount);

        uint256 realCapRatio = _getCapRatio(msg.sender);

        _mint(msg.sender, realCapRatio * _amount);

        emit DepositMaxTime(msg.sender, _amount, lockUntil);
    }

    /**
     * @notice Claims accumulated veFUR for flex deposit
     */
    function claim() public nonReentrant whenNotPaused {
        if (users[msg.sender].amount == 0) revert VEF__ZeroAmount();

        _claim(msg.sender);
    }

    /**
     * @notice Withdraw Furion token
     * @dev User will lose all veFUR once he withdrawed
     * @param _amount Amount to withdraw
     */
    function withdraw(uint256 _amount)
        external
        nonReentrant
        whenNotPaused
        noLocked(msg.sender)
    {
        if (_amount == 0) revert VEF__ZeroAmount();

        UserInfo storage user = users[msg.sender];
        if (user.amount < _amount) revert VEF__NotEnoughBalance();

        // reset last Release timestamp
        user.lastRelease = block.timestamp;

        // update his balance before burning or sending back Furion
        user.amount -= _amount;

        // get user veFUR balance that must be burned
        // those locked amount will not be calculated

        uint256 realCapRatio = _getCapRatio(msg.sender);

        uint256 userVeFURBalance = balanceOf(msg.sender) -
            user.amountLocked *
            realCapRatio;

        _burn(msg.sender, userVeFURBalance);

        // send back the staked Furion
        furion.safeTransfer(msg.sender, _amount);

        emit Withdraw(msg.sender, _amount);
    }

    /**
     * @notice Withdraw all the locked veFUR
     */
    function withdrawLocked()
        external
        nonReentrant
        whenNotPaused
        noLocked(msg.sender)
    {
        UserInfo memory user = users[msg.sender];

        if (user.amountLocked == 0) revert VEF__ZeroAmount();
        if (block.timestamp < user.lockUntil) revert VEF__TimeNotPassed();

        uint256 realCapRatio = _getCapRatio(msg.sender);

        _burn(msg.sender, user.amountLocked * realCapRatio);

        // update his balance before burning or sending back Furion
        users[msg.sender].amountLocked = 0;
        users[msg.sender].lockUntil = 0;

        // send back the staked Furion
        furion.safeTransfer(msg.sender, user.amountLocked);
    }

    /**
     * @notice Lock veFUR token
     * @dev Only whitelisted contract
     *      Income sharing contract will lock veFUR as entrance
     * @param _to User address
     * @param _amount Amount to lock
     */
    function lockVeFUR(address _to, uint256 _amount) external {
        // Only whitelisted contract can lock veFUR
        if (!whitelist[msg.sender]) revert VEF__NotWhiteListed();

        if (locked[_to] + _amount > balanceOf(_to)) revert VEF__OverLocked();

        _lock(_to, _amount);
        emit LockVeFUR(msg.sender, _to, _amount);
    }

    /**
     * @notice Unlock veFUR token
     * @param _to User address
     * @param _amount Amount to unlock
     */
    function unlockVeFUR(address _to, uint256 _amount) external {
        // Only whitelisted contract can unlock veFUR
        if (!whitelist[msg.sender]) revert VEF__NotWhiteListed();

        if (locked[_to] < _amount) revert VEF__OverLocked();

        _unlock(_to, _amount);
        emit UnlockVeFUR(msg.sender, _to, _amount);
    }

    /**
     * @notice Burn veFUR
     * @dev Only whitelisted contract
     *      For future use, some contracts may need veFUR for entrance
     * @param _to Address to burn
     * @param _amount Amount to burn
     */
    function burnVeFUR(address _to, uint256 _amount) public {
        // Only whitelisted contract can burn veFUR
        if (!whitelist[msg.sender]) revert VEF__NotWhiteListed();

        _burn(_to, _amount);
        emit BurnVeFUR(msg.sender, _to, _amount);
    }

    // ---------------------------------------------------------------------------------------- //
    // *********************************** Internal Functions ********************************* //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Finish claiming veFUR
     * @param _user User address
     */
    function _claim(address _user) internal {
        uint256 amount = claimable(_user);

        // update last release time
        users[_user].lastRelease = block.timestamp;

        if (amount > 0) {
            emit Claimed(_user, amount);
            _mint(_user, amount);
        }
    }

    /**
     * @notice Lock veFUR token
     * @param _to User address
     * @param _amount Amount to lock
     */
    function _lock(address _to, uint256 _amount) internal {
        locked[_to] += _amount;
    }

    /**
     * @notice Unlock veFUR token
     * @param _to User address
     * @param _amount Amount to unlock
     */
    function _unlock(address _to, uint256 _amount) internal {
        if (locked[_to] < _amount) revert VEF__NotEnoughBalance();
        locked[_to] -= _amount;
    }

    /**
     * @notice Get real cap ratio for a user
     *         The ratio depends on the boost type
     *
     * @param _user User address
     *
     * @return realCapRatio Real cap ratio
     */
    function _getCapRatio(address _user)
        internal
        view
        returns (uint256 realCapRatio)
    {
        if(_user == address(0)) revert VEF__ZeroAddress();
        realCapRatio = maxCapRatio;
    }
}
