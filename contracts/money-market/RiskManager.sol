// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./RiskManagerStorage.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./interfaces/ITokenBase.sol";
import "./interfaces/IRiskManager.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract RiskManager is RiskManagerStorage, Initializable, IRiskManager {
    function initialize() public initializer {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "RiskManager: Not authorized to call");
        _;
    }

    modifier onlyListed(address _fToken) {
        require(markets[_fToken].isListed, "RiskManager: Market is not listed");
        _;
    }

    function isRiskManager() public pure returns (bool) {
        return IS_RISK_MANAGER;
    }

    /**
     * @dev Returns the markets an account has entered.
     */
    function getMarketsEntered(address _account)
        external
        view
        returns (address[] memory)
    {
        // getAssetsIn
        address[] memory entered = marketsEntered[_account]; // accountAssets[]

        return entered;
    }

    /**
     * @dev Check if the given account has entered in the given asset.
     */
    function checkMembership(address _account, address _fToken)
        external
        view
        returns (bool)
    {
        return markets[_fToken].isMember[_account];
    }

    function checkListed(address _fToken) external view returns (bool) {
        return markets[_fToken].isListed;
    }

    /**
     * @dev Add assets to be included in account liquidity calculation
     */
    function enterMarkets(address[] memory _fTokens) public override {
        uint256 len = _fTokens.length;

        for (uint256 i; i < len; ) {
            addToMarketInternal(_fTokens[i], msg.sender);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Add the asset for liquidity calculations of borrower
     */
    function addToMarketInternal(address _fToken, address _borrower)
        internal
        onlyListed(_fToken)
    {
        Market storage marketToJoin = markets[_fToken];

        if (marketToJoin.isMember[_borrower] == true) {
            return;
        }

        // survived the gauntlet, add to list
        // NOTE: we store these somewhat redundantly as a significant optimization
        //  this avoids having to iterate through the list for the most common use cases
        //  that is, only when we need to perform liquidity checks
        //  and not whenever we want to check if an account is in a particular market
        marketToJoin.isMember[_borrower] = true;
        marketsEntered[_borrower].push(_fToken);

        emit MarketEntered(_fToken, _borrower);
    }

    /**
     * @dev Removes asset from sender's account liquidity calculation.
     *
     * Sender must not have an outstanding borrow balance in the asset,
     * or be providing necessary collateral for an outstanding borrow.
     */
    function exitMarket(address _fToken) external override {
        /// Get fToken balance and amount of underlying asset borrowed
        (uint256 tokensHeld, uint256 amountOwed, ) = ITokenBase(_fToken)
            .getAccountSnapshot(msg.sender);
        // Fail if the sender has a borrow balance
        require(amountOwed != 0, "RiskManager: Borrow balance is not zero");

        // Fail if the sender is not permitted to redeem all of their tokens
        require(
            redeemAllowed(_fToken, msg.sender, tokensHeld),
            "RiskManager: Cannot withdrawa all tokens"
        );

        Market storage marketToExit = markets[_fToken];

        // Already exited market
        if (!marketToExit.isMember[msg.sender]) {
            return;
        }

        // Set fToken membership to false
        delete marketToExit.isMember[msg.sender];

        // Delete fToken from the account’s list of assets
        // load into memory for faster iteration
        address[] memory assets = marketsEntered[msg.sender];
        uint256 len = assets.length;
        uint256 assetIndex;
        for (uint256 i; i < len; i++) {
            if (assets[i] == _fToken) {
                assetIndex = i;
                break;
            }
        }

        // We *must* have found the asset in the list or our redundant data structure is broken
        assert(assetIndex < len);

        // Copy last item in list to location of item to be removed, reduce length by 1
        address[] storage storedList = marketsEntered[msg.sender];
        storedList[assetIndex] = storedList[storedList.length - 1];
        storedList.pop();

        emit MarketExited(_fToken, msg.sender);
    }

    /********************************* Admin *********************************/

    /**
     * @notice Begins transfer of admin rights. The newPendingAdmin MUST call
     *  `acceptAdmin` to finalize the transfer.
     * @dev Admin function to begin change of admin. The newPendingAdmin MUST
     *  call `acceptAdmin` to finalize the transfer.
     * @param _newPendingAdmin New pending admin.
     */
    function setPendingAdmin(address _newPendingAdmin) external onlyAdmin {
        // Save current value, if any, for inclusion in log
        address oldPendingAdmin = pendingAdmin;

        // Store pendingAdmin with value newPendingAdmin
        pendingAdmin = _newPendingAdmin;

        // Emit NewPendingAdmin(oldPendingAdmin, newPendingAdmin)
        emit NewPendingAdmin(oldPendingAdmin, _newPendingAdmin);
    }

    /**
     * @notice Accepts transfer of admin rights. msg.sender must be pendingAdmin
     * @dev Admin function for pending admin to accept role and update admin
     */
    function acceptAdmin() external {
        // Check caller is pendingAdmin
        require(msg.sender == pendingAdmin, "TokenBase: Not pending admin");

        // Save current values for inclusion in log
        address oldAdmin = admin;
        address oldPendingAdmin = pendingAdmin;

        // Store admin with value pendingAdmin
        admin = pendingAdmin;

        // Clear the pending value
        pendingAdmin = address(0);

        emit NewAdmin(oldAdmin, admin);
        emit NewPendingAdmin(oldPendingAdmin, pendingAdmin);
    }

    /**
     * @notice Sets a new price oracle for the comptroller
     * @dev Admin function to set a new price oracle
     */
    function setPriceOracle(address _newOracle) external onlyAdmin {
        // Track the old oracle for the comptroller
        address oldOracle = address(oracle);

        // Set comptroller's oracle to newOracle
        oracle = IPriceOracle(_newOracle);

        // Emit NewPriceOracle(oldOracle, newOracle)
        emit NewPriceOracle(oldOracle, _newOracle);
    }

    function setVeToken(address _newVetoken) external onlyAdmin {
        veToken = IERC20(_newVetoken);
    }

    function setCloseFactor(uint256 _newCloseFactorMantissa)
        external
        onlyAdmin
    {
        uint256 oldCloseFactorMantissa = closeFactorMantissa;
        closeFactorMantissa = _newCloseFactorMantissa;

        emit NewCloseFactor(oldCloseFactorMantissa, closeFactorMantissa);
    }

    /**
     * @notice Sets the collateralFactor for a market
     * @dev Admin function to set per-market collateralFactor
     * @param _fToken The market to set the factor on
     * @param _newCollateralFactorMantissa The new collateral factor, scaled by 1e18
     */
    function setCollateralFactor(
        address _fToken,
        uint256 _newCollateralFactorMantissa
    ) external onlyAdmin onlyListed(_fToken) {
        Market storage market = markets[_fToken];

        Exp memory newCollateralFactorExp = Exp({
            mantissa: _newCollateralFactorMantissa
        });

        // Check collateral factor <= 0.9
        Exp memory limit = Exp({mantissa: COLLATERAL_FACTOR_MAX_MANTISSA});
        require(
            lessThanExp(newCollateralFactorExp, limit),
            "RiskManager: Collateral factor larger than limit"
        );

        // Fail if price == 0
        require(
            oracle.getUnderlyingPrice(_fToken) > 0,
            "RiskManager: Oracle price is 0"
        );

        // Set market's collateral factor to new collateral factor, remember old value
        uint256 oldCollateralFactorMantissa = market.collateralFactorMantissa;
        market.collateralFactorMantissa = _newCollateralFactorMantissa;

        // Emit event with asset, old collateral factor, and new collateral factor
        emit NewCollateralFactor(
            _fToken,
            oldCollateralFactorMantissa,
            _newCollateralFactorMantissa
        );
    }

    function setTier(address _fToken, uint256 _tier) external onlyAdmin {
        require(_tier > 0 && _tier <= maxTier, "RiskManager: Invalid tier");

        markets[_fToken].tier = _tier;
    }

    /**
     * @notice Add the market to the markets mapping and set it as listed
     * @dev Admin function to set isListed and add support for the market
     * @param _fToken The address of the market (token) to list
     * @param _tier Tier of the market
     */
    function supportMarket(
        address _fToken,
        uint256 _collateralFactorMantissa,
        uint256 _tier
    ) external onlyAdmin {
        require(
            !markets[_fToken].isListed,
            "RiskManager: Market already listed"
        );
        require(
            _collateralFactorMantissa <= COLLATERAL_FACTOR_MAX_MANTISSA,
            "RiskManager: Invalid collateral factor"
        );
        require(_tier <= maxTier, "RiskManager: Invalid tier");

        ITokenBase(_fToken).isFToken(); // Sanity check to make sure its really a CToken

        Market storage newMarket = markets[_fToken];
        newMarket.isListed = true;
        newMarket.collateralFactorMantissa = _collateralFactorMantissa;
        newMarket.tier = _tier;

        emit MarketListed(_fToken);
    }

    function setMintPaused(address _fToken, bool _state)
        external
        onlyListed(_fToken)
        onlyAdmin
        returns (bool)
    {
        mintGuardianPaused[_fToken] = _state;
        emit ActionPaused(_fToken, "Mint", _state);
        return _state;
    }

    function setBorrowPaused(address _fToken, bool _state)
        external
        onlyListed(_fToken)
        onlyAdmin
        returns (bool)
    {
        borrowGuardianPaused[_fToken] = _state;
        emit ActionPaused(_fToken, "Borrow", _state);
        return _state;
    }

    function setTransferPaused(bool _state) external onlyAdmin returns (bool) {
        transferGuardianPaused = _state;
        emit ActionPaused("Transfer", _state);
        return _state;
    }

    function setSeizePaused(bool _state) external onlyAdmin returns (bool) {
        seizeGuardianPaused = _state;
        emit ActionPaused("Seize", _state);
        return _state;
    }

    /********************************* Hooks *********************************/

    /**
     * NOTE: Although the hooks are free to call externally, it is important to
     * note that they may not be accurate when called externally by non-Furion
     * contracts because accrueInterest() is not called and lastAccrualBlock may
     * not be the same as current block number. In other words, market state may
     * not be up-to-date.
     */

    /**
     * @dev Checks if the account should be allowed to supply tokens in the given market.
     */
    function supplyAllowed(address _fToken) external view returns (bool) {
        // Pausing is a very serious situation - we revert to sound the alarms
        require(!mintGuardianPaused[_fToken], "RiskManager: Minting is paused");

        return true;
    }

    /**
     * @dev Checks if the account should be allowed to redeem fTokens for underlying
     *  asset in the given market.
     * @param _redeemTokens Amount of fTokens used for redemption.
     */
    function redeemAllowed(
        address _fToken,
        address _redeemer,
        uint256 _redeemTokens
    ) public view onlyListed(_fToken) returns (bool) {
        // Can freely redeem if redeemer never entered market, as liquidity calculation is not affected
        if (!markets[_fToken].isMember[_redeemer]) {
            return true;
        }

        // Otherwise, perform a hypothetical liquidity check to guard against shortfall
        (, uint256 shortfall) = getHypotheticalAccountLiquidity(
            _redeemer,
            _fToken,
            _redeemTokens,
            0
        );
        require(shortfall == 0, "RiskManager: Insufficient liquidity");

        return true;
    }

    /**
     * @notice Checks if the account should be allowed to borrow the underlying
     *  asset of the given market.
     * @param _fToken The market to verify the borrow against.
     * @param _borrower The account which would borrow the asset.
     * @param _borrowAmount The amount of underlying the account would borrow.
     *
     * NOTE: Borrowing is disallowed whenever a bad debt is found, no matter there
     * is spare liquidity in other tiers or not because the spare liquidity may be
     * used for liquidation (e.g. There may be spare liquidity for cross-tier +
     * isolation tier but a shortfall in collateral tier. If liquidation of
     * collateral tier collaterals are not enough to cover the debt, cross-tier
     * collaterals will also be used).
     */
    function borrowAllowed(
        address _fToken,
        address _borrower,
        uint256 _borrowAmount
    ) external override onlyListed(_fToken) returns (bool) {
        // Pausing is a very serious situation - we revert to sound the alarms
        require(
            !borrowGuardianPaused[_fToken],
            "RiskManager: Borrow is paused"
        );

        if (!markets[_fToken].isMember[_borrower]) {
            // only fToken contract may call borrowAllowed if borrower not in market
            require(
                msg.sender == _fToken,
                "RiskManager: Sender must be fToken contract"
            );

            // attempt to add borrower to the market
            addToMarketInternal(_fToken, _borrower);

            // it should be impossible to break the important invariant
            assert(markets[_fToken].isMember[_borrower]);
        }

        require(
            oracle.getUnderlyingPrice(_fToken) > 0,
            "RiskManager: Oracle price is 0"
        );

        (, uint256 shortfall) = getHypotheticalAccountLiquidity(
            _borrower,
            _fToken,
            0,
            _borrowAmount
        );
        require(shortfall == 0, "RiskManager: Bad debt found, cannot borrow");

        /*
        uint256 spareLiquidity;
        marketTier = markets[_fToken].tier;

        for (uint i = 1; i <= marketTier; ) {
            spareLiquidity += liquidities[liquidities.length - i];

            unchecked {
                ++i;
            }
        }
        require(spareLiquidity >= 0);
        */

        return true;
    }

    /**
     * @notice Checks if the account should be allowed to repay a borrow in the
     *  given market (if a market is listed)
     * @param _fToken The market to verify the repay against
     */
    function repayBorrowAllowed(address _fToken)
        external
        view
        onlyListed(_fToken)
        returns (bool)
    {
        return true;
    }

    /**
     * @notice Checks if the liquidation should be allowed to occur
     * @param _fTokenBorrowed Asset which was borrowed by the borrower
     * @param _fTokenCollateral Asset which was used as collateral and will be seized
     * @param _borrower The address of the borrower
     * @param _repayAmount The amount of underlying being repaid
     */
    function liquidateBorrowAllowed(
        address _fTokenBorrowed,
        address _fTokenCollateral,
        address _borrower,
        uint256 _repayAmount
    ) external view returns (bool) {
        require(
            liquidatableTime[_borrower] != 0,
            "RiskManager: Liquidation not yet initiated"
        );

        require(
            markets[_fTokenBorrowed].isListed &&
                markets[_fTokenCollateral].isListed,
            "RiskManager: Market is not listed"
        );

        // Stored version used because accrueInterest() has been called at the
        // beginning of liquidateBorrowInternal()
        uint256 borrowBalance = ITokenBase(_fTokenBorrowed).borrowBalanceStored(
            _borrower
        );

        (, uint256 shortfall) = getAccountLiquidity(_borrower);
        // The borrower must have shortfall in order to be liquidatable
        require(shortfall > 0, "RiskManager: Insufficient shortfall");

        /*
        // Liquidation should start from highest tier collaterals
        // (i.e. first liquidate collateral tier collaterals then cross-tier...)
        require(
            markets[_fTokenCollateral].tier == highestCollateralTier,
            "RiskManager: Liquidation should start from highest tier"
        );
        */

        // The liquidator may not repay more than what is allowed by the closeFactor
        uint256 maxClose = mul_ScalarTruncate(
            Exp({mantissa: closeFactorMantissa}),
            borrowBalance
        );
        require(maxClose > _repayAmount, "RiskManager: Repay too much");

        return true;
    }

    /**
     * @notice Checks if the seizing of assets should be allowed to occur
     * @param _fTokenCollateral Asset which was used as collateral and will be seized
     * @param _fTokenBorrowed Asset which was borrowed by the borrower
     * @param _borrower The address of the borrower
     */
    function seizeAllowed(
        address _fTokenCollateral,
        address _fTokenBorrowed,
        address _borrower,
        uint256 _seizeTokens
    ) external view returns (bool allowed, bool isCollateralTier) {
        // Pausing is a very serious situation - we revert to sound the alarms
        require(!seizeGuardianPaused, "RiskManager: Seize is paused");

        // Revert if borrower collateral token balance < seizeTokens
        require(
            IERC20Upgradeable(_fTokenCollateral).balanceOf(_borrower) >=
                _seizeTokens,
            "RiskManager: Seize token amount exceeds collateral"
        );

        require(
            markets[_fTokenBorrowed].isListed ||
                markets[_fTokenCollateral].isListed,
            "RiskManager: Market is not listed"
        );

        require(
            ITokenBase(_fTokenCollateral).getRiskManager() ==
                ITokenBase(_fTokenBorrowed).getRiskManager(),
            "RiskManager: Risk manager mismatch"
        );

        allowed = true;

        if (markets[_fTokenCollateral].tier == 1) {
            isCollateralTier = true;
        } else {
            isCollateralTier = false;
        }
    }

    /**
     * @notice Checks if the account should be allowed to transfer tokens in the given market
     * @param _fToken The market to verify the transfer against
     * @param _src The account which sources the tokens
     * @param _amount The number of fTokens to transfer
     */
    function transferAllowed(
        address _fToken,
        address _src,
        uint256 _amount
    ) external view returns (bool) {
        // Pausing is a very serious situation - we revert to sound the alarms
        require(!transferGuardianPaused, "transfer is paused");

        // Currently the only consideration is whether or not
        // the src is allowed to redeem this many tokens
        require(
            redeemAllowed(_fToken, _src, _amount),
            "RiskManager: Source not allowed to redeem that much fTokens"
        );

        return true;
    }

    /****************************** Liquidation *******************************/

    /**
     * @notice Mark an account as liquidatable, start dutch-auction
     * @param _account Address of account to be marked liquidatable
     */
    function initiateLiquidation(address _account) external {
        require(
            liquidatableTime[_account] == 0,
            "RiskManager: Already initiated liquidation"
        );

        (, uint256 shortfall) = getAccountLiquidity(_account);
        // The borrower must have shortfall in order to be liquidatable
        require(shortfall > 0, "RiskManager: Insufficient shortfall");

        liquidatableTime[_account] = block.number;
    }

    /**
     * @notice Account no longer susceptible to liquidation
     * @param _account Address of account to reset tracker
     *
     * NOTE: The modifier checks if function caller is fToken contract. Only listed
     * fTokens will have isLited set as true.
     */
    function closeLiquidation(address _account)
        external
        onlyListed(msg.sender)
    {
        (, uint256 shortfall) = getAccountLiquidity(_account);

        // Reset tracker only if there are no more bad debts
        if (shortfall == 0) {
            liquidatableTime[_account] = 0;
        }
    }

    function collateralFactorBoost(address _account)
        public
        view
        returns (uint256 boostMantissa)
    {
        uint256 veBalance = veToken.balanceOf(_account);
        // How many 0.1% the collateral factor will be increased by.
        // Result is rounded down by default which is fine
        uint256 multiplier = veBalance / COLLATERAL_FACTOR_BOOST_REQUIRED_TOKEN;

        boostMantissa = COLLATERAL_FACTOR_BOOST_INCREASE_MANTISSA * multiplier;

        if (boostMantissa > COLLATERAL_FACTOR_MAX_BOOST_MANTISSA) {
            boostMantissa = COLLATERAL_FACTOR_MAX_BOOST_MANTISSA;
        }
    }

    /**
     * @notice Determine the current account liquidity wrt collateral requirements
     * @return liquidities Hypothetical spare liquidity for each asset tier from low to high
     * @return shortfall Account shortfall below collateral requirements
     */
    function getAccountLiquidity(address _account)
        public
        view
        returns (uint256[] memory liquidities, uint256 shortfall)
    //uint256 highestCollateralTier
    {
        // address(0) -> no iteractions with market
        (
            liquidities,
            shortfall
            //highestCollateralTier
        ) = getHypotheticalAccountLiquidity(_account, address(0), 0, 0);
    }

    /**
     * @notice Determine what the account liquidity would be if the given amounts
     *  were redeemed/borrowed
     * @param _account The account to determine liquidity for
     * @param _fToken The market to hypothetically redeem/borrow in
     * @param _redeemToken The number of fTokens to hypothetically redeem
     * @param _borrowAmount The amount of underlying to hypothetically borrow
     * @dev Note that we calculate the exchangeRateStored for each collateral
     *  cToken using stored data, without calculating accumulated interest.
     * @return liquidities Hypothetical spare liquidity for each asset tier from low to high
     * @return shortfall Hypothetical account shortfall below collateral requirements
     *
     * NOTE: liquidities return sequence [tier 1 liquidity, tier 2 liquidity,
     * tier 3 liquidity]
     */
    function getHypotheticalAccountLiquidity(
        address _account,
        address _fToken,
        uint256 _redeemToken,
        uint256 _borrowAmount
    )
        public
        view
        returns (uint256[] memory liquidities, uint256 shortfall)
    //uint256 highestCollateralTier
    {
        /*
        // First assume highest collateral tier is isolation tier, because if
        // left uninitialized, it will remain to be the unvalid 0 tier
        highestCollateralTier = 3;
        */

        // Holds all our calculation results, see { RiskManagerStorage }
        AccountLiquidityLocalVars memory vars;
        TierLiquidity memory tl;

        uint256 maxTierMem = maxTier;

        // For each asset the account is in
        // Loop through to calculate colalteral and borrow values for each tier
        address[] memory assets = marketsEntered[_account];
        for (uint256 i; i < assets.length; ) {
            address asset = assets[i];
            uint256 assetTier = markets[asset].tier;

            // Read the balances and exchange rate from the asset (market)
            (
                vars.tokenBalance,
                vars.borrowBalance,
                vars.exchangeRateMantissa
            ) = ITokenBase(asset).getAccountSnapshot(_account);

            /*
            // If the asset is used as collateral, and has higher tier than the
            // current highestCollateralTier
            if (vars.tokenBalance > 0 && assetTier < highestCollateralTier) {
                highestCollateralTier = assetTier;
            }
            */

            uint256 boostMantissa = collateralFactorBoost(_account);

            vars.collateralFactor = Exp({
                mantissa: markets[asset].collateralFactorMantissa +
                    boostMantissa
            });
            vars.exchangeRate = Exp({mantissa: vars.exchangeRateMantissa});

            // Get the normalized price of the underlying asset of fToken
            vars.oraclePriceMantissa = oracle.getUnderlyingPrice(asset);
            require(
                vars.oraclePriceMantissa > 0,
                "RiskManager: Oracle price is 0"
            );
            vars.oraclePrice = Exp({mantissa: vars.oraclePriceMantissa});

            // Pre-compute a conversion factor from tokens -> ether (normalized price value)
            vars.collateralValuePerToken = mul_(
                mul_(vars.oraclePrice, vars.exchangeRate),
                vars.collateralFactor
            );

            tl.tierCollateralValues[assetTier - 1] += mul_(
                vars.tokenBalance,
                vars.collateralValuePerToken
            );

            tl.tierBorrowValues[assetTier - 1] += mul_(
                vars.borrowBalance,
                vars.oraclePrice
            );

            // Calculate effects of interacting with fToken
            if (asset == _fToken) {
                // Redeem effect
                // Collateral reduced after redemption
                // mul_: uint, exp -> uint
                tl.tierCollateralValues[assetTier - 1] -= mul_(
                    _redeemToken,
                    vars.collateralValuePerToken
                );

                // Add amount to hypothetically borrow
                // sumBorrowPlusEffects += oraclePrice * borrowAmount
                // mul_: uint, exp -> uint
                tl.tierBorrowValues[assetTier - 1] += mul_(
                    _borrowAmount,
                    vars.oraclePrice
                );
            }

            unchecked {
                ++i;
            }
        }

        // In most cases, borrowers would prefer to back borrows with the lowest
        // tier assets possible (i.e. isolation tier collateral -> isolation tier
        // borrow, instead of collateral tier collateral -> isolation tier borrow).
        // Therefore, we calculate starting from lowest tier (i.e. highest tier number).
        //
        // e.g. First iteration (accumulatedShortfall = 0):
        // isolation tier collateral > isolation tier borrow, push difference
        // to liquidities array; isolation collateral < isolation tier borrow,
        // add difference to `accumulatedShortfall` and see if higher tier collaterals
        // can back all borrows.
        // Second iteration (Assume accumulatedShortfall > 0):
        // cross-tier collateral > cross-tier borrow + accumulatedShortfall, push difference
        // to liquidities array; cross-tier collateral < cross-tier borrow + accumulatedShortfall,
        // accumulate tier shortfall to accumulatedShortfall and see if there are enough
        // collateral tier collateral to back the total shortfall
        for (uint256 i = maxTierMem; i > 0; ) {
            uint256 collateral = tl.tierCollateralValues[i - 1];
            uint256 borrow = tl.tierBorrowValues[i - 1];
            uint256 threshold = borrow + vars.accumulatedShortfall;

            if (collateral >= threshold) {
                liquidities[i - 1] = collateral - threshold;
                vars.accumulatedShortfall = 0;
            } else {
                vars.accumulatedShortfall = threshold - collateral;
                liquidities[i - 1] = 0;
            }

            unchecked {
                --i;
            }
        }

        // Return value
        shortfall = vars.accumulatedShortfall;
    }

    /**
     * @notice Calculate number of tokens of collateral asset to seize given an underlying amount
     * @dev Used in liquidation (called in fToken.liquidateBorrowInternal)
     * @param _fTokenBorrowed The address of the borrowed cToken
     * @param _fTokenCollateral The address of the collateral cToken
     * @param _repayAmount The amount of fTokenBorrowed underlying to convert into fTokenCollateral tokens
     * @return seizeTokens Number of fTokenCollateral tokens to be seized in a liquidation
     */
    function liquidateCalculateSeizeTokens(
        address _borrower,
        address _fTokenBorrowed,
        address _fTokenCollateral,
        uint256 _repayAmount
    ) external view override returns (uint256 seizeTokens, uint256 repayValue) {
        // Read oracle prices for borrowed and collateral markets
        uint256 priceBorrowedMantissa = oracle.getUnderlyingPrice(
            _fTokenBorrowed
        );
        uint256 priceCollateralMantissa = oracle.getUnderlyingPrice(
            _fTokenCollateral
        );
        require(
            priceBorrowedMantissa > 0 && priceCollateralMantissa > 0,
            "RiskManager: Oracle price is 0"
        );

        /**
         * Get the exchange rate and calculate the number of collateral tokens to seize:
         *  seizeAmount = actualRepayAmount * liquidationIncentive * priceBorrowed / priceCollateral
         *  seizeTokens = seizeAmount / exchangeRate
         *   = actualRepayAmount * (liquidationIncentive * priceBorrowed) / (priceCollateral * exchangeRate)
         */
        uint256 amountAfterDiscount = mul_ScalarTruncate(
            Exp({mantissa: liquidateCalculateDiscount(_borrower)}),
            _repayAmount
        );
        uint256 valueAfterDiscount = mul_ScalarTruncate(
            Exp({mantissa: priceBorrowedMantissa}),
            amountAfterDiscount
        );

        // Stored version used because accrueInterest() already called at the
        // beginning of liquidateBorrowInternal()
        uint256 collateralExchangeRateMantissa = ITokenBase(_fTokenCollateral)
            .exchangeRateStored(); // Note: reverts on error

        //   (value / underyling) * exchangeRate
        // = (value /underlying) * (underlying / token)
        // = value per token
        Exp memory valuePerToken = mul_(
            Exp({mantissa: priceCollateralMantissa}),
            Exp({mantissa: collateralExchangeRateMantissa})
        );

        // div_: uint, exp -> uint
        seizeTokens = div_(valueAfterDiscount, valuePerToken);
        repayValue = mul_ScalarTruncate(
            Exp({mantissa: priceBorrowedMantissa}),
            _repayAmount
        );
    }

    /**
     * @notice Get the discount for liquidating borrower at current moment
     * @param _borrower The account getting liquidated
     */
    function liquidateCalculateDiscount(address _borrower)
        public
        view
        returns (uint256 discountMantissa)
    {
        uint256 startBlock = liquidatableTime[_borrower];
        uint256 currentBlock = block.number;
        // Solidity rounds down result by default, which is fine
        uint256 discountIntervalPassed = (currentBlock - startBlock) /
            discountInterval;

        discountMantissa =
            LIQUIDATION_INCENTIVE_MIN_MANTISSA +
            discountIncreaseMantissa *
            discountIntervalPassed;
        if (discountMantissa > LIQUIDATION_INCENTIVE_MAX_MANTISSA) {
            discountMantissa = LIQUIDATION_INCENTIVE_MAX_MANTISSA;
        }
    }
}
