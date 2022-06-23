// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IPoolToken.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ProjectPool is IERC721Receiver {
    uint256 public constant SWAP_MINT_AMOUNT = 1000 * (10**18);
    uint256 public constant LOCK_MINT_AMOUNT = 500 * (10**18);
    //address public constant INCOME_SHARE_POOL = ;

    IPoolToken poolToken;
    IERC20 FUR;
    IERC721 NFT;

    address public factory;
    address public owner;

    struct LockInfo {
        address locker;
        uint128 releaseTime;
    }
    mapping(bytes32 => LockInfo) lockInfo;

    constructor() {
        factory = msg.sender;
    }

    function initialize(address _nftAddress, address _tokenAddress) external {
        require(msg.sender == factory, "ProjectPool: Not permitted to call.");

        poolToken = IPoolToken(_tokenAddress);
        // FUR token address, current placeholder: USDC address
        FUR = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
        NFT = IERC721(_nftAddress);
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "ProjectPool: You do not have permission."
        );
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
        require(
            poolToken.balanceOf(msg.sender) >= _amount,
            "ProjectPool: You don not have enough tokens."
        );
        require(
            poolToken.allowance(msg.sender, address(this)) >= _amount,
            "ProjectPool: Not enough amount of tokens approved."
        );
        _;
    }

    modifier unlockable(uint256 _id) {
        bytes32 fId = furionId(_id);

        require(
            lockInfo[fId].locker == msg.sender,
            "ProjectPool: You did not lock this NFT."
        );
        require(
            lockInfo[fId].releaseTime > uint128(block.timestamp),
            "ProjectPool: NFT has already been released to public pool."
        );
        _;
    }

    modifier releasable(uint256 _id) {
        bytes32 fId = furionId(_id);

        require(
            lockInfo[fId].locker != address(0),
            "ProjectPool: NFT is not locked."
        );
        require(
            lockInfo[fId].releaseTime != 0,
            "ProjectPool: NFT is locked forever."
        );
        require(
            lockInfo[fId].releaseTime < uint128(block.timestamp),
            "ProjectPool: Release time not yet reached."
        );
        _;
    }

    function furionId(uint256 _id) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(NFT), _id));
    }

    function sell(uint256 _id) external toPool(_id) {
        NFT.safeTransferFrom(msg.sender, address(this), _id);
        poolToken.mint(msg.sender, SWAP_MINT_AMOUNT);
    }

    function buy(uint256 _id) external checkBalance(SWAP_MINT_AMOUNT) {
        poolToken.burn(msg.sender, SWAP_MINT_AMOUNT);
        NFT.safeTransferFrom(address(this), msg.sender, _id);
    }

    /**
     * @param _lockPeriod Amount of time locked in days
     */
    function lock(uint256 _id, uint64 _lockPeriod) external toPool(_id) {
        require(
            _lockPeriod >= 30,
            "ProjectPool: Lock time must be at least 30 days."
        );

        bytes32 fId = furionId(_id);

        NFT.safeTransferFrom(msg.sender, address(this), _id);

        lockInfo[fId].locker = msg.sender;
        lockInfo[fId].releaseTime = uint128(
            block.timestamp + _lockPeriod * 24 * 60 * 60
        );

        poolToken.mint(msg.sender, LOCK_MINT_AMOUNT);
    }

    function redeem(uint256 _id)
        external
        unlockable(_id)
        checkBalance(LOCK_MINT_AMOUNT)
    {
        bytes32 fId = furionId(_id);

        poolToken.burn(msg.sender, LOCK_MINT_AMOUNT);

        delete lockInfo[fId];

        NFT.safeTransferFrom(address(this), msg.sender, _id);
    }

    function release(uint256 _id) external onlyOwner {
        bytes32 fId = furionId(_id);

        address sendRemainingTo = lockInfo[fId].locker;

        delete lockInfo[fId];

        poolToken.mint(sendRemainingTo, LOCK_MINT_AMOUNT);
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
