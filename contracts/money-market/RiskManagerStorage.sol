pragma solidity ^0.8.0;

contract RiskManagerStorage {
    bool public constant IS_RISK_MANAGER = true;

    // closeFactorMantissa must be strictly greater than this value
    uint256 internal constant CLOSE_FACTOR_MIN_MANTISSA = 0.05e18; // 0.05

    // closeFactorMantissa must not exceed this value
    uint256 internal constant CLOSE_FACTOR_MAX_MANTISSA = 0.1e18; // 0.1

    // No collateralFactorMantissa may exceed this value
    uint256 internal constant COLLATERAL_FACTOR_MAX_MANTISSA = 0.9e18; // 0.9

    /// @notice Administrator for this contract
    address public admin;

    /// @notice Pending administrator for this contract
    address public pendingAdmin;

    /// @notice Oracle which gives the price of underlying assets
    IPriceOracle public oracle;

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
     * @notice Official mapping of fTokens -> Market metadata
     * @dev Used e.g. to determine if a market is supported
     */
    mapping(address => Market) public markets;

    /**
     * @notice Mapping of account -> highest tier among collaterals supplied.
     *
     * Liquidation starts with most stable, valuable assets (collateral tier ->
     * cross-tier -> isolation tier).
     *
     * If the collateral asset happens to be really valuable and important, and
     * belongs to the colalteral tier, it can be bought back with 1.2x liquidation
     * price thanks to the liquidation protection.
     *
     * NOTE: The smaller the number, the higher the tier.
     */
    mapping(address => uint256) internal highestCollateralTier;

    // Largest tier number that markets can have, i.e. number for worst tier
    uint256 maxTier = 3;

    /**
     * @notice The Pause Guardian can pause certain actions as a safety mechanism.
     *
     * Actions which allow users to remove their own assets cannot be paused.
     * Liquidation / seizing / transfer can only be paused globally, not by market.
     */
    address public pauseGuardian;
    bool public _mintGuardianPaused;
    bool public _borrowGuardianPaused;
    bool public transferGuardianPaused;
    bool public seizeGuardianPaused;
    mapping(address => bool) public mintGuardianPaused;
    mapping(address => bool) public borrowGuardianPaused;

    /**
     * @dev Local vars for avoiding stack-depth limits in calculating account liquidity.
     *
     * Note: `tokenBalance` is the number of fTokens the account owns in the market,
     * `borrowBalance` is the amount of underlying that the account has borrowed.
     */
    struct AccountLiquidityLocalVars {
        uint256 sumCollateralValue;
        uint256 sumBorrowValue;
        uint256 tokenBalance;
        uint256 borrowBalance;
        uint256 exchangeRateMantissa;
        uint256 oraclePriceMantissa;
        mapping(uint256 => TierLiquidity) tierLiquidity;
        Exp collateralFactor;
        Exp exchangeRate;
        Exp oraclePrice;
        Exp collateralValuePerToken;
    }

    struct TierLiquidity {
        uint256 tierCollateralValue;
        uint256 tierBorrowValue;
    }
}
