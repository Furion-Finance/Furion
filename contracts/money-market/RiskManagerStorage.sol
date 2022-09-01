// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ExponentialNoError.sol";
import "./interfaces/IPriceOracle.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RiskManagerStorage is ExponentialNoError {
    bool public constant IS_RISK_MANAGER = true;

    // closeFactorMantissa must be strictly greater than this value
    uint256 internal constant CLOSE_FACTOR_MIN_MANTISSA = 5e16; // 5%

    // closeFactorMantissa must not exceed this value
    uint256 internal constant CLOSE_FACTOR_MAX_MANTISSA = 9e17; // 90%

    // No collateralFactorMantissa may exceed this value
    uint256 internal constant COLLATERAL_FACTOR_MAX_MANTISSA = 9e17; // 90%

    uint256 internal constant COLLATERAL_FACTOR_MAX_BOOST_MANTISSA = 2.5e16; // 2.5%

    uint256 internal constant COLLATERAL_FACTOR_BOOST_INCREASE_MANTISSA = 1e15; // 0.1%

    uint256 internal constant COLLATERAL_FACTOR_BOOST_REQUIRED_TOKEN =
        1000000e18; // 1000000 veFUR

    uint256 internal constant LIQUIDATION_INCENTIVE_MIN_MANTISSA = 1.05e18; // 105%

    uint256 internal constant LIQUIDATION_INCENTIVE_MAX_MANTISSA = 1.1e18; // 110%

    /// @notice Administrator for this contract
    address public admin;

    /// @notice Pending administrator for this contract
    address public pendingAdmin;

    IERC20 public veToken;

    /// @notice Oracle which gives the price of underlying assets
    IPriceOracle public oracle;

    uint256 public closeFactorMantissa;

    /// @notice List of assets an account has entered, capped by maxAssets
    mapping(address => address[]) public marketsEntered;

    struct Market {
        // Whether or not this market is listed
        bool isListed;
        //  Must be between 0 and 1, and stored as a mantissa
        //  For instance, 0.9 to allow borrowing 90% of collateral value
        uint256 collateralFactorMantissa;
        // Whether or not an account is entered in this market
        mapping(address => bool) isMember;
        /**
         * @notice Tiers: 1 - collateral, 2 - cross-tier, 3 - isolation
         *
         * Isolation assets can only be colalteral for isolation assets.
         * Cross-tier assets can be colalteral for cross-tier and isolation assets.
         * Collateral assets can be collateral for all assets.
         *
         * NOTE: The smaller the number, the higher the tier. This is because
         * lower tier assets may be added in the future.
         */
        uint256 tier;
    }

    /**
     * @notice Mapping of fTokens -> Market metadata
     * @dev Used e.g. to determine if a market is supported
     */
    mapping(address => Market) public markets;

    // Largest tier number that markets can have, i.e. number for worst tier
    uint256 maxTier;

    /**
     * @notice The Pause Guardian can pause certain actions as a safety mechanism.
     *
     * Actions which allow users to remove their own assets cannot be paused.
     * Liquidation / seizing / transfer can only be paused globally, not by market.
     */
    address public pauseGuardian;
    bool public _supplyGuardianPaused;
    bool public _borrowGuardianPaused;
    bool public transferGuardianPaused;
    bool public seizeGuardianPaused;
    mapping(address => bool) public supplyGuardianPaused;
    mapping(address => bool) public borrowGuardianPaused;

    /**
     * @notice Mapping of account -> time when account became liquidatable
     * @dev Records the block number when liquidation starts. Used for calculating
     *  liquidation discount rate.
     */
    mapping(address => uint256) public liquidatableTime;

    // After how many blocks will discount rate increase
    uint256 discountInterval;

    // By how much discount rate increases each time
    uint256 discountIncreaseMantissa;

    /**
     * @dev Local vars for avoiding stack-depth limits in calculating account liquidity.
     *
     * Note: `tokenBalance` is the number of fTokens the account owns in the market,
     * `borrowBalance` is the amount of underlying that the account has borrowed.
     */
    struct AccountLiquidityLocalVars {
        uint256 maxTierMem;
        address asset;
        uint256 assetTier;
        uint256 decimal;
        uint256 tokenBalance;
        uint256 borrowBalance;
        uint256 exchangeRateMantissa;
        uint256 oraclePriceMantissa;
        uint256 collateral;
        uint256 threshold;
        uint256 accumulatedShortfall;
        Exp collateralFactor;
        Exp exchangeRate;
        Exp oraclePrice;
        Exp collateralValuePerToken;
    }
}
