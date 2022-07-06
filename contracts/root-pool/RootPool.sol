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
    uint256 public constant MULTIPLIER = 1e18;
    // For testing only
    uint256 constant nftPrice = 10 ether;

    IERC20 FUR;
    IFFT FFT;
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
    {
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);

        // Both are enlarged by MULTIPLIER which cancels out in mint amount calculation
        uint256 tokenRefPrice = _refPricePerToken(_tokenAddress);
        uint256 fftRefPrice = _refPricePerFFT();
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
    {
        // Both are enlarged by MULTIPLIER which cancels out in retrieve amount calculation
        uint256 tokenRefPrice = _refPricePerToken(_tokenAddress);
        uint256 fftRefPrice = _refPricePerFFT();
        // Amount of F-* tokens to get back
        uint256 retrieveAmount = (_amount * fftRefPrice) / tokenRefPrice;
        uint256 fee = (_amount * unstakeFeeRate) / 100;

        // Burn amount of FFT used for exchange
        FFT.burn(msg.sender, _amount);
        // Transfer fee to fee receiver
        IERC20(address(FFT)).transferFrom(msg.sender, owner, fee);

        IERC20(_tokenAddress).transfer(msg.sender, retrieveAmount);
    }

    /**
     * @dev Get reference price of 1 F-* token (in ETH)
     *
     * @return Reference price enlarged by MULTIPLIER
     */
    function _refPricePerToken(address _tokenAddress)
        private
        view
        returns (uint256)
    {
        /*
        address nft = IProjectPoolFactory(factory).getNft(_tokenAddress);

        // Price of 1000 F-* tokens in terms of ETH
        uint256 refPrice = Oracle.getNFTPrice(nft, 0);
        */

        uint256 refPrice = nftPrice;

        // (refPrice / (1000 * 1e18)) * MULTIPLIER = (refPrice / 1000) * (MULTIPLIER / MULTIPLIER)
        return refPrice / 1000;
    }

    /**
     * @dev Get total value of all staked F-* tokens in contract (in ETH)
     *
     * @return Total value of F-* tokens enlarged by MULTIPLIER
     */
    function _refPriceSum() private view returns (uint256) {
        uint256 sum;

        for (uint256 i = 0; i < tokenTypes; ) {
            address token = getToken[i];

            uint256 refPrice = _refPricePerToken(token);
            // Number of F-* tokens in the contract
            uint256 balance = IERC20(token).balanceOf(address(this));

            sum += refPrice * balance;
        }

        return sum;
    }

    /**
     * @dev Get reference price of 1 FFT (in ETH)
     *
     * @return Price of 1 FFT enlarged by MULTIPLIER
     */
    function _refPricePerFFT() private view returns (uint256) {
        uint256 circulatingSupply = FFT.circulatingSupply();

        // For first mint
        if (circulatingSupply == 0) {
            return 0.01 ether * MULTIPLIER;
        } else {
            return _refPriceSum() / circulatingSupply;
        }
    }
}
