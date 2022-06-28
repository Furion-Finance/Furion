// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../tokens/interfaces/IFFT.sol";
import "./interfaces/IFurionOracle.sol";
import "../project-pool/interfaces/IProjectPoolFactory.sol";
// For F-* token and FUR
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// In this contract, pools refer to root pools and tokens refer to project pool
// tokens (i.e. project pools)

contract RootPool {
    IERC20 FUR;
    IFFT FFT;
    IFurionOracle Oracle;

    address public immutable factory;
    // Will be immutable for income sharing vault
    // Fees in this contract are in the form of FFT
    address public owner;

    // Accepted pool tokens for this root pool
    mapping(address => bool) registered;
    // Access all tokens for calculating sum of F-* reference price
    // ID to token address
    mapping(uint256 => address) getToken;

    // 0 - 100
    uint64 public stakeFeeRate = 1;
    uint64 public unstakeFeeRate = 3;
    // Serves as ID for F-* tokens in this pool
    uint128 public tokenTypes;

    constructor(
        address _fft,
        address _fur,
        address _oracle,
        address _owner,
        address[] memory _tokens
    ) {
        factory = msg.sender;
        FFT = IFFT(_fft);
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

        tokenTypes = uint128(_tokens.length);
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

    // Check pool token balance for staking and FFT balance for unstaking
    modifier checkBalance(address _tokenAddress, uint256 _amount) {
        uint256 totalAmount;
        uint256 allowanceAmount;
        // If the checking is for unstaking
        if (_tokenAddress == address(FFT)) {
            totalAmount = _amount + (_amount * unstakeFeeRate) / 100;
            // Only FFT fees needs to be transferred, others are burned
            allowanceAmount = (_amount * unstakeFeeRate) / 100;
        } else {
            totalAmount = _amount;
            allowanceAmount = _amount;
        }

        require(
            IERC20(_tokenAddress).balanceOf(msg.sender) >= totalAmount,
            "RootPool: You don not have enough tokens."
        );
        require(
            IERC20(_tokenAddress).allowance(msg.sender, address(this)) >=
                allowanceAmount,
            "RootPool: Not enough amount of tokens approved."
        );
        _;
    }

    /**
     * @dev Get reference price of 1 F-* token (in ETH)
     */
    function refPricePerToken(address _tokenAddress)
        public
        view
        returns (uint256)
    {
        address nft = IProjectPoolFactory(factory).getNft(_tokenAddress);

        // Price of 1000 F-* tokens in terms of ETH
        uint256 refPrice = Oracle.getNFTPrice(nft, 0);

        return refPrice / 1000;
    }

    /**
     * @dev Get total value of all staked F-* tokens in contract (in ETH)
     */
    function refPriceSum() public view returns (uint256) {
        uint256 sum;

        for (uint256 i = 0; i < tokenTypes; ) {
            address token = getToken[i];

            uint256 refPrice = refPricePerToken(token);
            // Number of F-* tokens in the contract
            uint256 balance = IERC20(token).balanceOf(address(this));

            sum += refPrice * balance;
        }

        return sum;
    }

    function refPricePerFFT() public view returns (uint256) {
        uint256 circulatingSupply = FFT.circulatingSupply();
        return refPriceSum() / circulatingSupply;
    }

    /**
     * @dev Change pool admin/fee receiver
     */
    function changeOwner(address _newOwner) external onlyFactory {
        owner = _newOwner;
    }

    /**
     * @dev Add F-* token to pool

    function registerToken(address _tokenAddress) external onlyFactory {
        registered[_tokenAddress] = true;
        numOfTokens++;
    }
    */

    /**
     * @dev Stake F-* tokens and mint FFT
     *
     * @param _tokenAddress Address of F-* token to stake
     * @param _amount Amount of F-* tokens to stake
     */
    function stake(address _tokenAddress, uint256 _amount)
        external
        tokenRegistered(_tokenAddress)
        checkBalance(_tokenAddress, _amount)
    {
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);

        uint256 tokenRefPrice = refPricePerToken(_tokenAddress);
        uint256 fftRefPrice = refPricePerFFT();
        // Amount of FFT to get before fee
        uint256 mintAmount = (_amount * tokenRefPrice) / fftRefPrice;
        // Amount of fee in FFT
        uint256 fee = (mintAmount * stakeFeeRate) / 100;

        FFT.mint(msg.sender, mintAmount - fee);
        FFT.mint(owner, fee);
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
        checkBalance(address(FFT), _amount)
    {
        uint256 tokenRefPrice = refPricePerToken(_tokenAddress);
        uint256 fftRefPrice = refPricePerFFT();
        // Amount of F-* tokens to get back
        uint256 retrieveAmount = (_amount * fftRefPrice) / tokenRefPrice;
        uint256 fee = (_amount * unstakeFeeRate) / 100;

        // Burn amount of FFT used for exchange
        FFT.burn(msg.sender, _amount);
        // Transfer fee to fee receiver
        IERC20(address(FFT)).transferFrom(msg.sender, owner, fee);

        IERC20(_tokenAddress).transfer(msg.sender, retrieveAmount);
    }
}
