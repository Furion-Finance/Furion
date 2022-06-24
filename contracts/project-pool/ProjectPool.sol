// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../tokens/interfaces/IPoolToken.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ProjectPool is IERC721Receiver {
    uint256 public constant SWAP_MINT_AMOUNT = 1000 * (10**18);
    uint256 public constant LOCK_MINT_AMOUNT = 500 * (10**18);

    IPoolToken poolToken;
    //IERC20 FUR;
    IERC721 NFT;

    address public factory;
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

    constructor() {
        factory = msg.sender;
    }

    function initialize(
        address _nftAddress,
        address _tokenAddress,
        address _owner
    ) external onlyFactory {
        poolToken = IPoolToken(_tokenAddress);
        //FUR = IERC20();
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

    modifier checkBalance(uint256 _amount) {
        uint256 total;
        if (_amount == SWAP_MINT_AMOUNT) {
            total = _amount * (1 + swapFeeRate / 100);
        } else if (_amount == LOCK_MINT_AMOUNT) {
            total = _amount * (1 + lockFeeRate / 100);
        }

        require(
            poolToken.balanceOf(msg.sender) >= total,
            "ProjectPool: You don not have enough tokens."
        );
        require(
            poolToken.allowance(msg.sender, address(this)) >= total,
            "ProjectPool: Not enough amount of tokens approved."
        );
        _;
    }

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

    function getFurionId(uint256 _id) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(NFT), _id));
    }

    function setBuyFeeRate(uint128 _rate) external onlyOwner {
        require(_rate >= 0 && _rate <= 100, "ProjectPool: Invalid fee rate.");
        swapFeeRate = _rate;
    }

    function setRedeemFeeRate(uint128 _rate) external onlyOwner {
        require(_rate >= 0 && _rate <= 100, "ProjectPool: Invalid fee rate.");
        lockFeeRate = _rate;
    }

    function changeOwner(address _newOwner) external onlyFactory {
        address oldOwner = owner;
        owner = _newOwner;

        emit OwnerChanged(oldOwner, _newOwner);
    }

    function sell(uint256 _id) external toPool(_id) {
        NFT.safeTransferFrom(msg.sender, address(this), _id);
        poolToken.mint(msg.sender, SWAP_MINT_AMOUNT);

        emit SoldNFT(getFurionId(_id), msg.sender);
    }

    function buy(uint256 _id) external checkBalance(SWAP_MINT_AMOUNT) {
        uint256 fee = (SWAP_MINT_AMOUNT * swapFeeRate) / 100;
        poolToken.burn(msg.sender, SWAP_MINT_AMOUNT);
        poolToken.transferFrom(msg.sender, owner, fee);

        NFT.safeTransferFrom(address(this), msg.sender, _id);

        emit BoughtNFT(getFurionId(_id), msg.sender);
    }

    /**
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

        poolToken.mint(msg.sender, LOCK_MINT_AMOUNT);

        emit LockedNFT(fId, msg.sender, block.timestamp, _lockPeriod);
    }

    function redeem(uint256 _id)
        external
        unlockable(_id)
        checkBalance(LOCK_MINT_AMOUNT)
    {
        bytes32 fId = getFurionId(_id);

        poolToken.burn(msg.sender, LOCK_MINT_AMOUNT);

        // Undecided fee collection method for NFT redemption
        // poolToken.transferFrom(msg.sender, owner, fee);

        delete lockInfo[fId];

        NFT.safeTransferFrom(address(this), msg.sender, _id);

        emit RedeemedNFT(fId, msg.sender);
    }

    function release(uint256 _id) external onlyOwner {
        bytes32 fId = getFurionId(_id);

        address sendRemainingTo = lockInfo[fId].locker;

        delete lockInfo[fId];

        poolToken.mint(sendRemainingTo, LOCK_MINT_AMOUNT);

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
