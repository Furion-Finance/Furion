// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SeparatePool is ERC20Permit, IERC721Receiver {
    address constant KITTIES = 0x06012c8cf97BEaD5deAe237070F9587f8E7A266d;
    address constant PUNKS = 0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB;

    uint256 public constant SWAP_MINT_AMOUNT = 1000e18;
    uint256 public constant LOCK_MINT_AMOUNT = 500e18;
    uint256 public constant RELEASE_MINT_AMOUNT = 200e18;

    IERC20 FUR;

    address public immutable factory;
    address public immutable nft;
    // Transfer fee to income maker
    address public immutable incomeMaker;
    // Pool admin/fee receiver
    // Fees in this contract are in the form of F-* tokens
    address public owner;

    uint256 buyFee = 100e18;
    uint256 lockFee = 150e18;

    struct LockInfo {
        address locker;
        bool extended; // Can only extend once
        uint256 releaseTime;
    }
    mapping(bytes32 => LockInfo) lockInfo;

    uint16[] public inPool;

    event OwnerChanged(address oldOwner, address newOwner);
    event SoldNFT(bytes32 indexed fId, address indexed seller);
    event BoughtNFT(bytes32 indexed fId, address indexed buyer);
    event LockedNFT(
        bytes32 indexed fId,
        address indexed locker,
        uint256 timeOfLock,
        uint256 expiryTime
    );
    event RedeemedNFT(bytes32 indexed fId, address indexed redeemer);
    event ReleasedNFT(bytes32 indexed fId);

    constructor(
        address _nftAddress,
        address _incomeMaker,
        address _fur,
        address _owner,
        string memory _tokenName,
        string memory _tokenSymbol
    ) ERC20Permit(_tokenName) ERC20(_tokenName, _tokenSymbol) {
        factory = msg.sender;
        incomeMaker = _incomeMaker;
        nft = _nftAddress;
        FUR = IERC20(_fur);
        owner = _owner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "SeparatePool: Not permitted to call.");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "SeparatePool: Not permitted to call.");
        _;
    }

    // Check if caller is NFT locker,
    //       if withdrawal is within release time
    modifier redeemable(uint256 _id) {
        bytes32 fId = getFurionId(_id);

        require(
            lockInfo[fId].locker == msg.sender,
            "SeparatePool: You did not lock this NFT."
        );
        require(
            lockInfo[fId].releaseTime > block.timestamp,
            "SeparatePool: NFT has already been released to public pool."
        );
        _;
    }

    // Check if NFT is locked,
    //       if releaseTime has passed
    modifier releasable(uint256 _id) {
        bytes32 fId = getFurionId(_id);

        require(
            lockInfo[fId].locker != address(0),
            "SeparatePool: NFT is not locked."
        );
        require(
            lockInfo[fId].releaseTime < block.timestamp,
            "SeparatePool: Release time not yet reached."
        );
        _;
    }

    /**
     * @dev Compute NFT furion ID
     */
    function getFurionId(uint256 _id) public view returns (bytes32) {
        return keccak256(abi.encodePacked(nft, _id));
    }

    /**
     * @dev Release time getter for testing
     */
    function getReleaseTime(uint256 _id) public view returns (uint256) {
        bytes32 fId = getFurionId(_id);

        return lockInfo[fId].releaseTime;
    }

    /**
     * @dev Change fee rate for buying NFT after governance voting
     */
    function setBuyFee(uint128 _newFee) external onlyOwner {
        buyFee = _newFee;
    }

    /**
     * @dev Change fee rate for redeeming NFT after governance voting
     */
    function setLockFee(uint128 _newFee) external onlyOwner {
        lockFee = _newFee;
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
    function sellBatch(uint256[] calldata _ids) external {
        // Number of NFTs in list
        uint256 length = _ids.length;
        require(length < 10, "SeparatePool: Can only sell 9 NFTs at once");

        for (uint256 i; i < length; ) {
            // Mint total amount all at once, so _updateNow is false
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
    function buyBatch(uint256[] calldata _ids) external {
        // Number of NFTs to buy
        uint256 length = _ids.length;
        require(length < 10, "SeparatePool: Can only buy 9 NFTs at once");

        uint256 burnTotal = SWAP_MINT_AMOUNT * length;
        uint256 feeTotal = buyFee * length;
        _burn(msg.sender, burnTotal);
        FUR.transferFrom(msg.sender, incomeMaker, feeTotal);

        for (uint256 i; i < length; ) {
            // Collected fee all at once, so _updateNow is false
            _buy(_ids[i], false);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Lock NFT to pool and get 500 pool tokens
     */
    function lock(uint256 _id) external {
        _lock(_id, true);
    }

    /**
     * @dev Lock multiple NFTs of same collection
     */
    function lockBatch(uint256[] calldata _ids) external {
        // Number of NFTs to buy
        uint256 length = _ids.length;
        require(length < 10, "SeparatePool: Can only buy 9 NFTs at once");

        uint256 mintTotal = LOCK_MINT_AMOUNT * length;
        uint256 feeTotal = buyFee * length;
        FUR.transferFrom(msg.sender, incomeMaker, feeTotal);

        for (uint256 i; i < length; ) {
            // Collected fee all at once, so _updateNow is false
            _lock(_ids[i], false);

            unchecked {
                ++i;
            }
        }

        _mint(msg.sender, mintTotal);
    }

    /**
     * @notice Lockers can only extend release time once
     * @dev EXTENDS release time by one month
     */
    function payFee(uint256 _id) external {
        bytes32 fId = getFurionId(_id);

        LockInfo memory li = lockInfo[fId];

        require(
            li.locker == msg.sender,
            "SeparatePool: You did not lock this NFT."
        );
        require(
            li.releaseTime > block.timestamp,
            "SeparatePool: NFT already released"
        );
        require(!li.extended, "SeparatePool: Already extended once");

        FUR.transferFrom(msg.sender, incomeMaker, lockFee);

        lockInfo[fId].extended = true;
        lockInfo[fId].releaseTime += 30 days;
    }

    /**
     * @notice Lockers must redeem NFT if it has already been extended
     * @dev Redeem locked NFT by paying 500 tokens
     */
    function redeem(uint256 _id) external redeemable(_id) {
        bytes32 fId = getFurionId(_id);

        _burn(msg.sender, LOCK_MINT_AMOUNT);

        delete lockInfo[fId];

        _transferOutNFT(msg.sender, _id);

        emit RedeemedNFT(fId, msg.sender);
    }

    /**
     * @notice Only 200 pool tokens is minted to locker as a penalty
     * @dev Release NFT for swapping and mint pool tokens to locker
     */
    function release(uint256 _id) external onlyOwner releasable(_id) {
        bytes32 fId = getFurionId(_id);

        address sendRemainingTo = lockInfo[fId].locker;

        delete lockInfo[fId];

        _mint(sendRemainingTo, RELEASE_MINT_AMOUNT);
        _mint(incomeMaker, LOCK_MINT_AMOUNT - RELEASE_MINT_AMOUNT);

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
        _transferInNFT(_id);

        if (_updateNow) {
            _mint(msg.sender, SWAP_MINT_AMOUNT);
        }

        emit SoldNFT(getFurionId(_id), msg.sender);
    }

    /**
     * @dev Buy NFT from pool by paying 1000 pool tokens
     *
     * @param _updateNow Determines if burning is done immediately or skipped
     *        because of batch purchase
     */
    function _buy(uint256 _id, bool _updateNow) private {
        if (_updateNow) {
            _burn(msg.sender, SWAP_MINT_AMOUNT);

            FUR.transferFrom(msg.sender, incomeMaker, buyFee);
        }

        _transferOutNFT(msg.sender, _id);

        emit BoughtNFT(getFurionId(_id), msg.sender);
    }

    function _lock(uint256 _id, bool _updateNow) private {
        _transferInNFT(_id);

        if (_updateNow) {
            FUR.transferFrom(msg.sender, incomeMaker, lockFee);

            _mint(msg.sender, LOCK_MINT_AMOUNT);
        }

        bytes32 fId = getFurionId(_id);

        lockInfo[fId].locker = msg.sender;
        uint256 _releaseTime = block.timestamp + 30 * 24 * 60 * 60;
        lockInfo[fId].releaseTime = _releaseTime;

        emit LockedNFT(fId, msg.sender, block.timestamp, _releaseTime);
    }

    function _transferInNFT(uint256 _id) internal {
        bytes memory data;

        if (nft == KITTIES) {
            // CryptoKitties
            data = abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                msg.sender,
                address(this),
                _id
            );
        } else if (nft == PUNKS) {
            // CryptoPunks
            bytes memory punksIndexToOwner = abi.encodeWithSignature(
                "punkIndexToAddress(uint256)",
                _id
            );
            (bool _success, bytes memory result) = nft.staticcall(
                punksIndexToOwner
            );
            address punkOwner = abi.decode(result, (address));
            require(
                _success && punkOwner == msg.sender,
                "SeparatePool: Punk ownership check failed"
            );
            data = abi.encodeWithSignature("buyPunk(uint256)", _id);
        } else {
            // ERC 721
            data = abi.encodeWithSignature(
                "safeTransferFrom(address,address,uint256)",
                msg.sender,
                address(this),
                _id
            );
        }

        (bool success, bytes memory returnData) = nft.call(data);
        require(success, string(returnData));

        inPool.push(uint16(_id));
    }

    function _transferOutNFT(address _dst, uint256 _id) internal {
        bytes memory data;

        if (nft == KITTIES) {
            // CryptoKitties
            data = abi.encodeWithSignature(
                "transfer(address,uint256)",
                _dst,
                _id
            );
        } else if (nft == PUNKS) {
            // CryptoPunks
            data = abi.encodeWithSignature(
                "transferPunk(address,uint256)",
                _dst,
                _id
            );
        } else {
            // ERC 721
            data = abi.encodeWithSignature(
                "safeTransferFrom(address,address,uint256)",
                address(this),
                _dst,
                _id
            );
        }

        (bool success, bytes memory returnData) = nft.call(data);
        require(success, string(returnData));

        _removeElement(_id);
    }

    /**
     * @notice Remove ID of NFT that is no longer in pool from inPool array
     */
    function _removeElement(uint256 _idToRemove) internal {
        uint256 length = inPool.length;

        for (uint256 i; i < length; ) {
            if (inPool[i] == uint16(_idToRemove)) {
                inPool[i] = inPool[length - 1];
                inPool.pop();
                break;
            }

            unchecked {
                ++i;
            }
        }
    }
}
