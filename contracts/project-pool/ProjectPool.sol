// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@prb/math/contracts/PRBMathUD60x18.sol";

contract ProjectPool is ERC20Permit, IERC721Receiver {
    uint256 public constant SWAP_MINT_AMOUNT = 1000 * (10**18);
    uint256 public constant LOCK_MINT_AMOUNT = 500 * (10**18);

    //IERC20 FUR;
    IERC721 NFT;

    address public immutable factory;
    // Pool admin/fee receiver
    // Fees in this contract are in the form of F-* tokens
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
    ) ERC20Permit(_tokenName) ERC20(_tokenName, _tokenSymbol) {
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

    // Check if caller is NFT locker,
    //       if withdrawal is within release time
    modifier redeemable(uint256 _id) {
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
    //       if releaseTime has passed
    modifier releasable(uint256 _id) {
        bytes32 fId = getFurionId(_id);

        require(
            lockInfo[fId].locker != address(0),
            "ProjectPool: NFT is not locked."
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
     * @dev Sell single NFT and mint 1000 tokens immediately
     */
    function sell(uint256 _id) external {
        _sell(_id, true);
    }

    /**
     * @dev Sell multiple NFTs of same collection in one tx
     */
    function sell(uint256[] calldata _ids) external {
        // Number of NFTs in list
        uint256 length = _ids.length;

        for (uint256 i = 0; i < length; ) {
            // Mint total amount all at once
            _sell(_ids[i], false);

            unchecked {
                ++i;
            }
        }

        _mint(msg.sender, SWAP_MINT_AMOUNT * length);
    }

    /**
     * @dev Buy single NFT and burn 1000 tokens immediately
     */
    function buy(uint256 _id) external {
        _buy(_id, true);
    }

    /**
     * @dev Buy multiple NFTs of same collection in one tx
     */
    function buy(uint256[] calldata _ids) external {
        // Number of NFTs to buy
        uint256 length = _ids.length;

        uint256 burnTotal = SWAP_MINT_AMOUNT * length;
        uint256 feeTotal = (burnTotal * swapFeeRate) / 100;
        _burn(msg.sender, burnTotal);
        transfer(owner, feeTotal);

        for (uint256 i = 0; i < length; ) {
            // Mint total amount all at once
            _buy(_ids[i], false);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Lock NFT to pool and get 500 pool tokens
     *
     * @param _lockCycle 30 days is one cycle, pay fee for future cycles at
     *        the moment of locking
     */
    function lock(uint256 _id, uint256 _lockCycle) external {
        require(_lockCycle != 0, "ProjectPool: Invalid lock cycle");

        bytes32 fId = getFurionId(_id);

        NFT.safeTransferFrom(msg.sender, address(this), _id);

        uint256 fee = (LOCK_MINT_AMOUNT * _lockCycle * lockFeeRate) / 100;
        transfer(owner, fee);

        lockInfo[fId].locker = msg.sender;
        lockInfo[fId].releaseTime = uint96(
            block.timestamp + _lockCycle * 30 * 24 * 60 * 60
        );

        if (fee < LOCK_MINT_AMOUNT) {
            _mint(msg.sender, LOCK_MINT_AMOUNT - fee);
        }

        emit LockedNFT(fId, msg.sender, block.timestamp, _lockCycle * 30);
    }

    /**
     * @dev EXTENDS release time by one cycle
     */
    function payFee(uint256 _id) external redeemable(_id) {
        bytes32 fId = getFurionId(_id);

        uint256 fee = (LOCK_MINT_AMOUNT * lockFeeRate) / 100;
        transfer(owner, fee);

        lockInfo[fId].releaseTime += 30 * 24 * 60 * 60;
    }

    /**
     * @dev Redeem locked NFT by paying 500 tokens
     */
    function redeem(uint256 _id) external redeemable(_id) {
        bytes32 fId = getFurionId(_id);

        _burn(msg.sender, LOCK_MINT_AMOUNT);

        delete lockInfo[fId];

        NFT.safeTransferFrom(address(this), msg.sender, _id);

        emit RedeemedNFT(fId, msg.sender);
    }

    /**
     * @dev Release NFT for swapping and mint remaining 500 pool tokens to locker
     */
    function release(uint256 _id) external onlyOwner releasable(_id) {
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

    /**
     * @dev Sell NFT to pool and get 1000 pool tokens
     *
     * @param _updateNow Determines if minting is done immediately or after
     *        multiple calls (batched)
     */
    function _sell(uint256 _id, bool _updateNow) private {
        NFT.safeTransferFrom(msg.sender, address(this), _id);

        if (_updateNow) {
            _mint(msg.sender, SWAP_MINT_AMOUNT);
        }

        emit SoldNFT(getFurionId(_id), msg.sender);
    }

    /**
     * @dev Buy NFT from pool by paying (1000 + fee) pool tokens
     *
     * @param _updateNow Determines if burning is done immediately or skipped
     *        because of batch purchase
     */
    function _buy(uint256 _id, bool _updateNow) private {
        if (_updateNow) {
            _burn(msg.sender, SWAP_MINT_AMOUNT);

            uint256 fee = (SWAP_MINT_AMOUNT * swapFeeRate) / 100;
            transfer(owner, fee);
        }

        NFT.safeTransferFrom(address(this), msg.sender, _id);

        emit BoughtNFT(getFurionId(_id), msg.sender);
    }
}
