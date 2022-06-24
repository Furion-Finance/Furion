// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ProjectPool is ERC20, IERC721Receiver {
    uint256 public constant SWAP_MINT_AMOUNT = 1000 * (10**18);
    uint256 public constant LOCK_MINT_AMOUNT = 500 * (10**18);

    //IERC20 FUR;
    IERC721 NFT;

    address public factory;
    // Pool admin/fee receiver
    address public owner;

    // 0 - 100
    uint128 swapFeeRate = 1;
    uint128 lockFeeRate = 3;

    struct LockInfo {
        address locker;
        uint96 releaseTime;
    }
    mapping(bytes32 => LockInfo) lockInfo;

    event OwnerChanged(address oldOwner, address newOwner);
    event SoldNFT(bytes32 indexed fId, address indexed seller);
    event BoughtNFT(bytes32 indexed fId, address indexed buyer);
    event LockedNFT(
        bytes32 indexed fId,
        address indexed locker,
        uint256 timeOfLock,
        uint256 periodInDays
    );
    event RedeemedNFT(bytes32 indexed fId, address indexed redeemer);
    event ReleasedNFT(bytes32 indexed fId);

    constructor(
        address _nftAddress,
        address _owner,
        string memory _tokenName,
        string memory _tokenSymbol
    ) ERC20(_tokenName, _tokenSymbol) {
        factory = msg.sender;
        NFT = IERC721(_nftAddress);
        owner = _owner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "ProjectPool: Not permitted to call.");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "ProjectPool: Not permitted to call.");
        _;
    }

    // Check NFT ownership and approval
    modifier toPool(uint256 _id) {
        require(
            NFT.ownerOf(_id) == msg.sender,
            "ProjectPool: You are not owner of the NFT."
        );
        require(
            NFT.getApproved(_id) == address(this),
            "ProjectPool: NFT not yet approved for transfer."
        );
        _;
    }

    // Check caller pool token balance and approval
    modifier checkBalance(uint256 _amount) {
        uint256 total;
        if (_amount == SWAP_MINT_AMOUNT) {
            total = _amount * (1 + swapFeeRate / 100);
        } else if (_amount == LOCK_MINT_AMOUNT) {
            total = _amount * (1 + lockFeeRate / 100);
        }

        require(
            balanceOf(msg.sender) >= total,
            "ProjectPool: You don not have enough tokens."
        );
        require(
            allowance(msg.sender, address(this)) >= total,
            "ProjectPool: Not enough amount of tokens approved."
        );
        _;
    }

    // Check if caller is NFT locker,
    //       if withdrawal is  within release time
    modifier unlockable(uint256 _id) {
        bytes32 fId = getFurionId(_id);

        require(
            lockInfo[fId].locker == msg.sender,
            "ProjectPool: You did not lock this NFT."
        );
        require(
            lockInfo[fId].releaseTime > uint96(block.timestamp),
            "ProjectPool: NFT has already been released to public pool."
        );
        _;
    }

    // Check if NFT is locked,
    //       if NFT is locked forever,
    //       if releaseTime has passed
    modifier releasable(uint256 _id) {
        bytes32 fId = getFurionId(_id);

        require(
            lockInfo[fId].locker != address(0),
            "ProjectPool: NFT is not locked."
        );
        require(
            lockInfo[fId].releaseTime != 0,
            "ProjectPool: NFT is locked forever."
        );
        require(
            lockInfo[fId].releaseTime < uint96(block.timestamp),
            "ProjectPool: Release time not yet reached."
        );
        _;
    }

    /**
     * @dev Compute NFT furion ID
     */
    function getFurionId(uint256 _id) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(NFT), _id));
    }

    /**
     * @dev Change fee rate for buying NFT after governance voting
     */
    function setBuyFeeRate(uint128 _rate) external onlyOwner {
        require(_rate >= 0 && _rate <= 100, "ProjectPool: Invalid fee rate.");
        swapFeeRate = _rate;
    }

    /**
     * @dev Change fee rate for redeeming NFT after governance voting
     */
    function setRedeemFeeRate(uint128 _rate) external onlyOwner {
        require(_rate >= 0 && _rate <= 100, "ProjectPool: Invalid fee rate.");
        lockFeeRate = _rate;
    }

    /**
     * @dev Change pool admin/fee receiver
     */
    function changeOwner(address _newOwner) external onlyFactory {
        address oldOwner = owner;
        owner = _newOwner;

        emit OwnerChanged(oldOwner, _newOwner);
    }

    /**
     * @dev Sell NFT to pool and get 1000 pool tokens
     */
    function sell(uint256 _id) external toPool(_id) {
        NFT.safeTransferFrom(msg.sender, address(this), _id);
        _mint(msg.sender, SWAP_MINT_AMOUNT);

        emit SoldNFT(getFurionId(_id), msg.sender);
    }

    /**
     * @dev Buy NFT from pool by paying (1000 + fee) pool tokens
     */
    function buy(uint256 _id) external checkBalance(SWAP_MINT_AMOUNT) {
        uint256 fee = (SWAP_MINT_AMOUNT * swapFeeRate) / 100;
        _burn(msg.sender, SWAP_MINT_AMOUNT);
        transferFrom(msg.sender, owner, fee);

        NFT.safeTransferFrom(address(this), msg.sender, _id);

        emit BoughtNFT(getFurionId(_id), msg.sender);
    }

    /**
     * @dev Lock NFT to pool and get 500 pool tokens
     *
     * @param _lockPeriod Amount of time locked in days, 0 is forever
     */
    function lock(uint256 _id, uint256 _lockPeriod) external toPool(_id) {
        require(
            _lockPeriod >= 30,
            "ProjectPool: Lock time must be at least 30 days."
        );

        bytes32 fId = getFurionId(_id);

        NFT.safeTransferFrom(msg.sender, address(this), _id);

        lockInfo[fId].locker = msg.sender;
        lockInfo[fId].releaseTime = uint96(
            block.timestamp + _lockPeriod * 24 * 60 * 60
        );

        _mint(msg.sender, LOCK_MINT_AMOUNT);

        emit LockedNFT(fId, msg.sender, block.timestamp, _lockPeriod);
    }

    /**
     * @dev Redeem locked NFT by paying (500 + fee) pool tokens and clear lock info
     */
    function redeem(uint256 _id)
        external
        unlockable(_id)
        checkBalance(LOCK_MINT_AMOUNT)
    {
        bytes32 fId = getFurionId(_id);

        _burn(msg.sender, LOCK_MINT_AMOUNT);

        // Undecided fee collection method for NFT redemption
        // transferFrom(msg.sender, owner, fee);

        delete lockInfo[fId];

        NFT.safeTransferFrom(address(this), msg.sender, _id);

        emit RedeemedNFT(fId, msg.sender);
    }

    /**
     * @dev Release NFT for swapping and mint remaining 500 pool tokens to locker
     */
    function release(uint256 _id) external onlyOwner {
        bytes32 fId = getFurionId(_id);

        address sendRemainingTo = lockInfo[fId].locker;

        delete lockInfo[fId];

        _mint(sendRemainingTo, LOCK_MINT_AMOUNT);

        emit ReleasedNFT(fId);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
