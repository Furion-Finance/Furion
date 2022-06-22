// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IPoolToken.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ProjectPool is IERC721Receiver {
    uint256 public constant STAKE_MINT_AMOUNT = 1000 * (10**18);
    uint256 public constant LOCK_MINT_AMOUNT = 500 * (10**18);
    address public owner;

    IPoolToken poolToken;
    IERC721 nft;

    address public factory;
    uint128 public releaseTime = 7 days;

    struct LockInfo {
        address locker;
        uint128 lockTime;
    }
    mapping(uint256 => LockInfo) lockInfo;

    constructor() {
        factory = msg.sender;
    }

    function initialize(address _nftAddress, address _tokenAddress) external {
        require(msg.sender == factory, "ProjectPool: Not permitted to call.");

        nft = IERC721(_nftAddress);
        poolToken = IPoolToken(_tokenAddress);
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "ProjectPool: You do not have permission."
        );
        _;
    }

    modifier stakable(uint256 _id) {
        require(
            nft.ownerOf(_id) == msg.sender,
            "ProjectPool: You are not owner of the NFT."
        );
        require(
            nft.getApproved(_id) == address(this),
            "ProjectPool: NFT not yet approved for transfer."
        );
        _;
    }

    modifier unstakable(uint256 _id) {
        require(
            poolToken.balanceOf(msg.sender) >= STAKE_MINT_AMOUNT,
            "ProjectPool: Not enough tokens to redeem the NFT."
        );
        require(
            poolToken.allowance(msg.sender, address(this)) >= STAKE_MINT_AMOUNT,
            "ProjectPool: Not enough amount of tokens approved."
        );
        _;
    }

    modifier unlockable(uint256 _id) {
        require(
            lockInfo[_id].locker == msg.sender,
            "ProjectPool: You did not lock this NFT."
        );
        require(
            (lockInfo[_id].lockTime + releaseTime) < uint128(block.timestamp),
            "ProjectPool: NFT has already been released to public pool."
        );
        require(
            poolToken.balanceOf(msg.sender) >= LOCK_MINT_AMOUNT,
            "ProjectPool: Not enough tokens to redeem the NFT."
        );
        require(
            poolToken.allowance(msg.sender, address(this)) >= LOCK_MINT_AMOUNT,
            "ProjectPool: Not enough amount of tokens approved."
        );
        _;
    }

    modifier releasable(uint256 _id) {
        require(
            lockInfo[_id].locker != address(0),
            "ProjectPool: NFT is not locked."
        );
        require(
            lockInfo[_id].lockTime + releaseTime > uint128(block.timestamp),
            ""
        );
        _;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function stake(uint256 _id) external stakable(_id) {
        nft.safeTransferFrom(msg.sender, address(this), _id);
        poolToken.mint(msg.sender, STAKE_MINT_AMOUNT);
    }

    function unstake(uint256 _id) external unstakable(_id) {
        poolToken.burn(msg.sender, STAKE_MINT_AMOUNT);
        nft.safeTransferFrom(address(this), msg.sender, _id);
    }

    function lock(uint256 _id) external stakable(_id) {
        nft.safeTransferFrom(msg.sender, address(this), _id);

        lockInfo[_id].locker = msg.sender;
        lockInfo[_id].lockTime = uint128(block.timestamp);

        poolToken.mint(msg.sender, LOCK_MINT_AMOUNT / 2);
    }

    function unlock(uint256 _id) external unlockable(_id) {
        poolToken.burn(msg.sender, LOCK_MINT_AMOUNT);

        delete lockInfo[_id];

        nft.safeTransferFrom(address(this), msg.sender, _id);
    }

    function release(uint256 _id) external onlyOwner {
        delete lockInfo[_id];
    }
}
