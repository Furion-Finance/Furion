// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IFurionOracle.sol";
import "../project-pool/interfaces/IProjectPoolFactory.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
// For F-* token and FUR
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

// In this contract, pools refer to root pools and tokens refer to project pool
// tokens (i.e. project pools)

contract RootPool is ERC20Permit {
    //uint256 public constant MULTIPLIER = 1e18;
    // For testing only
    uint256 constant NFT_PRICE = 15 ether;
    // For testing only, simulate NFT price growth
    uint256 constant NFT_PRICE_1 = 18 ether;

    IERC20 FUR;
    IFurionOracle Oracle;

    address public immutable factory;
    // Will be immutable for income sharing vault
    // Fees in this contract are in the form of FFT
    address public owner;

    // Accepted pool tokens for this root pool
    mapping(address => bool) public registered;
    // Access all tokens for calculating sum of F-* reference price
    // ID to token address
    mapping(uint256 => address) private getToken;

    // Fees in FUR
    uint112 public stakeFee = 100 * 10**18;
    uint112 public unstakeFee = 100 * 10**18;
    // Serves as ID for F-* tokens in this pool (ID for next token to be registered)
    uint32 public tokenTypes;

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
        address _fur,
        address _oracle,
        address _owner,
        address[] memory _tokens,
        string memory _tokenName,
        string memory _tokenSymbol
    ) ERC20Permit(_tokenName) ERC20(_tokenName, _tokenSymbol) {
        factory = msg.sender;
        FUR = IERC20(_fur);
        Oracle = IFurionOracle(_oracle);
        owner = _owner;

        // Checked support at factory, register tokens upon pool creation
        for (uint256 i = 0; i < _tokens.length; ) {
            registered[_tokens[i]] = true;
            getToken[i] = _tokens[i];

            unchecked {
                ++i;
            }
        }

        tokenTypes = uint32(_tokens.length);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "RootPool: Not permitted to call.");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "RootPool: Not permitted to call.");
        _;
    }

    // Check if pool token is registered
    modifier tokenRegistered(address _tokenAddress) {
        require(
            registered[_tokenAddress] == true,
            "RootPool: Token not accepted in this pool."
        );
        _;
    }

    function circulatingSupply() public view returns (uint256) {
        // Total supply - balance of all contracts that locked FFT
        // return totalSupply() - balanceOf()
        return totalSupply();
    }

    /**
     * @dev Change pool admin/fee receiver
     */
    function changeOwner(address _newOwner) external onlyFactory {
        owner = _newOwner;
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
     * @param _price for testing only, 0 uses NFT_PRICE, 1 uses NFT_PRICE_1
     */
    function stake(
        address _tokenAddress,
        uint256 _amount,
        uint256 _price
    ) external tokenRegistered(_tokenAddress) {
        // Both are enlarged by MULTIPLIER which cancels out in mint amount calculation
        uint256 tokenRefPrice = _refPricePerToken(_tokenAddress, _price);
        uint256 fftRefPrice = _refPricePerFFT(_price);
        // Amount of FFT to get before fee
        uint256 mintAmount = (_amount * tokenRefPrice) / fftRefPrice;

        // Transfer FUR (fees)
        FUR.transferFrom(msg.sender, owner, 100 ether);
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
    function unstake(
        address _tokenAddress,
        uint256 _amount,
        uint256 _price
    ) external tokenRegistered(_tokenAddress) {
        // Both are enlarged by MULTIPLIER which cancels out in retrieve amount calculation
        uint256 tokenRefPrice = _refPricePerToken(_tokenAddress, _price);
        uint256 fftRefPrice = _refPricePerFFT(_price);

        // Amount of F-* tokens to get back
        uint256 retrieveAmount = (_amount * fftRefPrice) / tokenRefPrice;

        // Transfer FUR (fees)
        FUR.transferFrom(msg.sender, owner, uint256(unstakeFee));
        // Burn FFT used for exchange
        _burn(msg.sender, _amount);

        // Transfer pool tokens to caller
        IERC20(_tokenAddress).transfer(msg.sender, retrieveAmount);

        emit UnstakedToken(_tokenAddress, msg.sender, retrieveAmount);
    }

    /**
     * @dev Get reference price of 1 F-* token (in ETH)
     *
     * @return Reference price enlarged by MULTIPLIER
     */
    function _refPricePerToken(address _tokenAddress, uint256 _price)
        private
        view
        returns (uint256)
    {
        /*
        address nft = IProjectPoolFactory(factory).getNft(_tokenAddress);

        // Price of 1000 F-* tokens in terms of ETH
        uint256 refPrice = Oracle.getNFTPrice(nft, 0);
        */

        uint256 refPrice;
        if (_price == 0) {
            refPrice = NFT_PRICE;
        } else if (_price == 1) {
            refPrice = NFT_PRICE_1;
        }

        // (refPrice / (1000 * 1e18)) * MULTIPLIER = (refPrice / 1000) * (MULTIPLIER / MULTIPLIER)
        return refPrice / 1000;
    }

    /**
     * @dev Get total value of all staked F-* tokens in this pool (in ETH)
     *
     * @return Total value enlarged by MULTIPLIER
     */
    function _refPriceSum(uint256 _price) private view returns (uint256) {
        uint256 sum;

        for (uint256 i = 0; i < tokenTypes; ) {
            address token = getToken[i];

            uint256 refPrice = _refPricePerToken(token, _price);
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
    function _refPricePerFFT(uint256 _price) private view returns (uint256) {
        uint256 _circulatingSupply = circulatingSupply();

        // For first mint
        if (_circulatingSupply == 0) {
            return 0.01 ether;
        } else {
            return _refPriceSum(_price) / _circulatingSupply;
        }
    }
}
