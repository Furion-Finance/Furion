// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IFractionalAggregatePool.sol";
import "./interfaces/IFurionPricingOracle.sol";
import "../separate-pool/interfaces/ISeparatePoolFactory.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
// For F-* token and FUR
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

// In this contract, pools refer to root pools and tokens refer to project pool
// tokens (i.e. project pools)

contract FractionalAggregatePool is ERC20Permit, IFractionalAggregatePool {
    IERC20 FUR;
    IFurionPricingOracle oracle;
    ISeparatePoolFactory spFactory;

    address public immutable factory;
    address public immutable incomeMaker;
    // Will be immutable for income sharing vault
    // Fees in this contract are in the form of FFT
    address public owner;

    // Accepted pool tokens for this root pool
    mapping(address => bool) public registered;
    // Access all tokens for calculating sum of F-* reference price
    // ID to token address
    mapping(uint256 => address) private getToken;

    // Fees in FUR
    uint256 public stakeFee = 100e18;
    uint256 public unstakeFee = 100e18;
    // Serves as ID for F-* tokens in this pool (ID for next token to be registered)
    uint256 public tokenTypes;

    event RegisteredToken(address tokenAddress);
    event StakedToken(
        address indexed tokenAddress,
        address indexed staker,
        uint256 tokenAmount
    );
    event UnstakedToken(
        address indexed tokenAddress,
        address indexed unstaker,
        uint256 tokenAmount
    );

    constructor(
        address _incomeMaker,
        address _fur,
        address _oracle,
        address _spFactory,
        address _owner,
        address[] memory _tokens,
        string memory _tokenName,
        string memory _tokenSymbol
    ) ERC20Permit(_tokenName) ERC20(_tokenName, _tokenSymbol) {
        factory = msg.sender;
        incomeMaker = _incomeMaker;
        FUR = IERC20(_fur);
        oracle = IFurionPricingOracle(_oracle);
        spFactory = ISeparatePoolFactory(_spFactory);
        owner = _owner;

        uint256 length = _tokens.length;

        // Checked support at factory, register tokens upon pool creation
        for (uint256 i; i < length; ) {
            registered[_tokens[i]] = true;
            getToken[i] = _tokens[i];

            unchecked {
                ++i;
            }
        }

        tokenTypes = length;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "AggregatePool: Not permitted to call.");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "AggregatePool: Not permitted to call.");
        _;
    }

    // Check if pool token is registered
    modifier tokenRegistered(address _tokenAddress) {
        require(
            registered[_tokenAddress] == true,
            "AggregatePool: Token not accepted in this pool."
        );
        _;
    }

    function circulatingSupply() public view returns (uint256) {
        // Total supply - balance of all contracts that locked FFT
        // return totalSupply() - balanceOf()
        return totalSupply();
    }

    function setStakeFee(uint256 _newStakeFee) external onlyOwner {
        stakeFee = _newStakeFee;
    }

    function setUnstakeFee(uint256 _newUnstakeFee) external onlyOwner {
        unstakeFee = _newUnstakeFee;
    }

    /**
     * @dev Change pool admin/fee receiver
     */
    function changeOwner(address _newOwner) external onlyFactory {
        owner = _newOwner;
    }

    function setFur(address _newFur) external onlyFactory {
        FUR = IERC20(_newFur);
    }

    /**
     * @dev Add F-* token to pool
     */
    function registerToken(address _tokenAddress) external onlyOwner {
        registered[_tokenAddress] = true;
        getToken[tokenTypes] = _tokenAddress;
        tokenTypes++;

        emit RegisteredToken(_tokenAddress);
    }

    /**
     * @dev Stake F-* tokens and mint FFT
     *
     * @param _tokenAddress Address of F-* token to stake
     * @param _amount Amount of F-* tokens to stake
     */
    function stake(address _tokenAddress, uint256 _amount)
        external
        tokenRegistered(_tokenAddress)
    {
        // Both are enlarged by MULTIPLIER which cancels out in mint amount calculation
        uint256 tokenRefPrice = _refPricePerToken(_tokenAddress);
        uint256 fftRefPrice = _refPricePerFFT(_tokenAddress);
        // Amount of FFT to get before fee
        uint256 mintAmount = (_amount * tokenRefPrice) / fftRefPrice;

        // Transfer FUR (fees)
        FUR.transferFrom(msg.sender, incomeMaker, stakeFee);
        // Transfer pool tokens to be staked
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);
        // Mint FFT
        _mint(msg.sender, mintAmount);

        emit StakedToken(_tokenAddress, msg.sender, _amount);
    }

    /**
     * @dev Burn FFT and get F-* tokens
     *
     * @param _tokenAddress Address of F-* token to get
     * @param _amount Amount of FFT to burn
     */
    function unstake(address _tokenAddress, uint256 _amount)
        external
        tokenRegistered(_tokenAddress)
    {
        // Both are enlarged by MULTIPLIER which cancels out in retrieve amount calculation
        uint256 tokenRefPrice = _refPricePerToken(_tokenAddress);
        uint256 fftRefPrice = _refPricePerFFT(_tokenAddress);

        // Amount of F-* tokens to get back
        uint256 retrieveAmount = (_amount * fftRefPrice) / tokenRefPrice;

        // Transfer FUR (fees)
        FUR.transferFrom(msg.sender, incomeMaker, unstakeFee);
        // Burn FFT used for exchange
        _burn(msg.sender, _amount);

        // Transfer pool tokens to caller
        IERC20(_tokenAddress).transfer(msg.sender, retrieveAmount);

        emit UnstakedToken(_tokenAddress, msg.sender, retrieveAmount);
    }

    /**
     * @dev Get reference price of 1 F-* token (in ETH)
     *
     * @return Reference price scaled by 1e18
     */
    function _refPricePerToken(address _tokenAddress)
        private
        view
        returns (uint256)
    {
        address nft = spFactory.getNftByPool(_tokenAddress);
        require(
            nft != address(0),
            "AggregatePool: Unrecognized separate pool provided"
        );

        // Price of 1000 F-* tokens in terms of ETH
        uint256 refPrice = oracle.getNFTPrice(nft, 0);

        // (refPrice / (1000 * 1e18)) * MULTIPLIER = (refPrice / 1000) * (MULTIPLIER / MULTIPLIER)
        return refPrice / 1000;
    }

    /**
     * @dev Get total value of all staked F-* tokens in this pool (in ETH)
     *
     * @return Total value scaled by 1e18
     */
    function _refPriceSum(address _tokenAddress)
        private
        view
        returns (uint256)
    {
        uint256 sum;

        for (uint256 i; i < tokenTypes; ) {
            address token = getToken[i];

            uint256 refPrice = _refPricePerToken(_tokenAddress);
            // Number of F-* tokens in the contract
            uint256 balance = IERC20(token).balanceOf(address(this));

            sum += refPrice * balance;

            unchecked {
                ++i;
            }
        }

        return sum;
    }

    /**
     * @dev Get reference price of 1 FFT (in ETH)
     *
     * @return Price of 1 FFT enlarged by MULTIPLIER
     */
    function _refPricePerFFT(address _tokenAddress)
        private
        view
        returns (uint256)
    {
        uint256 _circulatingSupply = circulatingSupply();

        // For first mint
        if (_circulatingSupply == 0) {
            return 0.01 ether;
        } else {
            return _refPriceSum(_tokenAddress) / _circulatingSupply;
        }
    }
}
