// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IAggregatePool.sol";
import "./interfaces/IFurionPricingOracle.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "../utils/TransferNFT.sol";
import "hardhat/console.sol";

contract AggregatePool is
    ERC20Permit,
    TransferNFT,
    IERC721Receiver,
    IAggregatePool
{
    IERC20 FUR;
    IFurionPricingOracle oracle;

    address public immutable factory;
    address public immutable incomeMaker;
    address public owner;
    // Serves as ID for nfts in this pool (ID for next nft to be registered)
    // Starts at 1
    uint256 public types;

    uint256 buyFee = 100e18;
    uint256 lockFee = 150e18;

    // Accepted nfts for this aggregate pool
    mapping(address => bool) public registered;
    // Access all nfts for calculating sum of nft reference price
    // ID to nft address
    mapping(uint256 => address) public getNft;

    struct LockInfo {
        address locker;
        bool extended; // Can only extend once
        uint256 releaseTime;
        uint256 remaining; // Amount to transfer to locker if nft is released
    }
    mapping(bytes32 => LockInfo) public lockInfo;

    constructor(
        address _incomeMaker,
        address _fur,
        address _oracle,
        address _owner,
        address[] memory _nfts,
        string memory _name,
        string memory _symbol
    ) ERC20Permit(_name) ERC20(_name, _symbol) {
        factory = msg.sender;
        incomeMaker = _incomeMaker;
        FUR = IERC20(_fur);
        oracle = IFurionPricingOracle(_oracle);
        owner = _owner;

        uint256 length = _nfts.length;

        for (uint256 i; i < length; ) {
            registered[_nfts[i]] = true;
            getNft[i] = _nfts[i];

            unchecked {
                ++i;
            }
        }

        types = length;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "AP: Unpermitted call");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "AP: Unpermitted call");
        _;
    }

    // Check if nft is registered
    modifier nftRegistered(address _nft) {
        require(registered[_nft] == true, "AP: Unregistered NFT");
        _;
    }

    // Check if caller is NFT locker,
    //       if withdrawal is within release time
    modifier unlockable(address _nft, uint256 _id) {
        bytes32 fId = getFurionId(_nft, _id);

        require(lockInfo[fId].locker == msg.sender, "AP: Not locker");
        require(
            lockInfo[fId].releaseTime > block.timestamp,
            "AP: NFT already released"
        );
        _;
    }

    // Check if NFT is locked,
    //       if releaseTime has passed
    modifier releasable(address _nft, uint256 _id) {
        bytes32 fId = getFurionId(_nft, _id);

        require(lockInfo[fId].locker != address(0), "AP: NFT not locked");
        require(
            lockInfo[fId].releaseTime < block.timestamp,
            "AP: Release time not yet reached"
        );
        _;
    }

    /**
     * @dev Compute NFT furion ID
     */
    function getFurionId(address _nft, uint256 _id)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_nft, _id));
    }

    /**
     * @dev Get complete lock info of NFT
     */
    function getLockInfo(address _nft, uint256 _id)
        public
        view
        returns (LockInfo memory)
    {
        bytes32 fId = getFurionId(_nft, _id);

        return lockInfo[fId];
    }

    /**
     * @dev Total supply - balance of all contracts that locked FFT
     */
    function circulatingSupply() public view returns (uint256) {
        // return totalSupply() - balanceOf()
        return totalSupply();
    }

    /**
     * @dev Get total value of all staked nfts in this pool (in ETH)
     * @return sum Total value scaled by 1e18
     */
    function refPriceSum() public view returns (uint256) {
        uint256 sum;

        for (uint256 i; i < types; ) {
            address nft = getNft[i];

            uint256 refPrice = oracle.getNFTPrice(nft, 0);

            // Number of nfts in the contract
            uint256 balance = _balanceOfNFT(nft, address(this));

            // Total value for stored nfts and locked nfts for a collection
            uint256 collectionTotal = refPrice * balance;

            sum += collectionTotal;

            unchecked {
                ++i;
            }
        }

        return sum * 1e18;
    }

    /**
     * @dev Get reference price of 1e18 FFT (in ETH)
     * @return Price of 1e18 FFT
     */
    function refPricePerFFT() public view returns (uint256) {
        uint256 _circulatingSupply = circulatingSupply();

        // For first mint
        if (_circulatingSupply == 0) {
            return 0.01 ether;
        } else {
            return refPriceSum() / _circulatingSupply;
        }
    }

    /**
     * @dev Change pool admin (fee & address setter)
     */
    function changeOwner(address _newOwner) external onlyFactory {
        owner = _newOwner;
    }

    function setFur(address _newFur) external onlyFactory {
        FUR = IERC20(_newFur);
    }

    /**
     * @dev Include new nft to pool
     */
    function registerToken(address _nft) external onlyOwner {
        registered[_nft] = true;
        getNft[types] = _nft;
        types++;
    }

    function store(address _nft, uint256 _id) external {
        _store(_nft, _id, true);
    }

    function storeBatch(address _nft, uint256[] calldata _ids) external {
        require(_ids.length < 10, "AP: Store limit per tx reached");

        uint256 mintAmount;
        uint256 fftPrice = refPricePerFFT();

        for (uint256 i; i < _ids.length; ) {
            _store(_nft, _ids[i], false);

            uint256 nftPrice = oracle.getNFTPrice(_nft, _ids[i]);
            mintAmount += (nftPrice * 1e18) / fftPrice;

            unchecked {
                ++i;
            }
        }

        _mint(msg.sender, mintAmount);
    }

    function lock(address _nft, uint256 _id) external {
        _lock(_nft, _id, true);
    }

    function lockBatch(address _nft, uint256[] calldata _ids) external {
        require(_ids.length < 10, "AP: Lock limit per tx reached");
        _collectFee(lockFee * _ids.length);

        uint256 mintAmount;

        for (uint256 i; i < _ids.length; ) {
            mintAmount += _lock(_nft, _ids[i], false);

            unchecked {
                ++i;
            }
        }

        _mint(msg.sender, mintAmount);
        _mint(address(this), mintAmount);
    }

    function buy(address _nft, uint256 _id) external {
        _buy(_nft, _id, true);
    }

    function buyBatch(address _nft, uint256[] calldata _ids) external {
        console.log("buyBatch");
        require(_ids.length < 10, "AP: Buy limit per tx reached");
        _collectFee(buyFee * _ids.length);

        uint256 burnAmount;
        uint256 fftPrice = refPricePerFFT();
        for (uint256 i; i < _ids.length; ) {
            uint256 nftPrice = oracle.getNFTPrice(_nft, _ids[i]);
            burnAmount += (nftPrice * 1e18) / fftPrice;

            unchecked {
                ++i;
            }
        }
        _burn(msg.sender, burnAmount);

        for (uint256 i; i < _ids.length; ) {
            _buy(_nft, _ids[i], false);

            unchecked {
                ++i;
            }
        }
    }

    function unlock(address _nft, uint256 _id)
        external
        nftRegistered(_nft)
        unlockable(_nft, _id)
    {
        bytes32 fId = getFurionId(_nft, _id);

        uint256 nftPrice = oracle.getNFTPrice(_nft, _id);
        uint256 fftPrice = refPricePerFFT();
        uint256 burnAmount = ((nftPrice * 1e18) / fftPrice) / 2;
        _burn(msg.sender, burnAmount);
        _burn(address(this), lockInfo[fId].remaining);

        delete lockInfo[fId];

        _transferOutNFT(_nft, msg.sender, _id);
    }

    /**
     * @notice Only 40% of remaining FFT is minted to locker as a penalty
     * @dev Release NFT for swapping and mint FFT to locker
     */
    function release(address _nft, uint256 _id)
        external
        onlyOwner
        nftRegistered(_nft)
        releasable(_nft, _id)
    {
        bytes32 fId = getFurionId(_nft, _id);

        address sendRemainingTo = lockInfo[fId].locker;
        uint256 remaining = lockInfo[fId].remaining;

        delete lockInfo[fId];

        transfer(sendRemainingTo, (remaining * 40) / 100);
        transfer(incomeMaker, remaining - (remaining * 40) / 100);
    }

    /**
     * @notice Lockers can only extend release time once
     * @dev EXTENDS release time by one month
     */
    function payFee(address _nft, uint256 _id) external nftRegistered(_nft) {
        bytes32 fId = getFurionId(_nft, _id);

        LockInfo memory li = lockInfo[fId];

        require(li.locker == msg.sender, "AP: You did not lock this NFT.");
        require(li.releaseTime > block.timestamp, "AP: NFT already released");
        require(!li.extended, "AP: Already extended once");

        _collectFee(lockFee);

        lockInfo[fId].extended = true;
        lockInfo[fId].releaseTime += 30 days;
    }

    function _collectFee(uint256 _amount) private {
        FUR.transferFrom(msg.sender, incomeMaker, _amount);
    }

    function _store(
        address _nft,
        uint256 _id,
        bool _updateNow
    ) private nftRegistered(_nft) {
        uint256 nftPrice = oracle.getNFTPrice(_nft, _id);
        uint256 fftPrice = refPricePerFFT();
        uint256 mintAmount = (nftPrice * 1e18) / fftPrice;

        _transferInNFT(_nft, _id);

        if (_updateNow) {
            _mint(msg.sender, mintAmount);
        }
    }

    function _lock(
        address _nft,
        uint256 _id,
        bool _updateNow
    ) private nftRegistered(_nft) returns (uint256) {
        _transferInNFT(_nft, _id);

        uint256 nftPrice = oracle.getNFTPrice(_nft, _id);
        uint256 fftPrice = refPricePerFFT();
        uint256 mintAmount = ((nftPrice * 1e18) / fftPrice) / 2;

        if (_updateNow) {
            _collectFee(lockFee);
            _mint(msg.sender, mintAmount);
        }

        bytes32 fId = getFurionId(_nft, _id);

        lockInfo[fId].locker = msg.sender;
        lockInfo[fId].releaseTime = block.timestamp + 30 * 24 * 60 * 60;
        lockInfo[fId].remaining = mintAmount;

        return mintAmount;
    }

    function _buy(
        address _nft,
        uint256 _id,
        bool _updateNow
    ) private nftRegistered(_nft) {
        if (_updateNow) {
            _collectFee(buyFee);

            uint256 nftPrice = oracle.getNFTPrice(_nft, _id);
            uint256 fftPrice = refPricePerFFT();
            uint256 burnAmount = (nftPrice * 1e18) / fftPrice;

            _burn(msg.sender, burnAmount);
        }

        _transferOutNFT(_nft, msg.sender, _id);
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
