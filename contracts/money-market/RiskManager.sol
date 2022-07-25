pragma solidity ^0.8.0;

import "./RiskManagerStorage.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract RiskManager is RiskManagerStorage, Initializable {
    function initialize() initializer {
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

    /**
     * @dev Add assets to be included in account liquidity calculation
     */
    function enterMarkets(address[] memory _fTokens) public override {
        uint256 len = _fTokens.length;

        for (uint256 i; i < len; ) {
            addToMarketInternal(_fToken, msg.sender);

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
        accountAssets[_borrower].push(_fToken);

        emit MarketEntered(_fToken, _borrower);
    }

    /**
     * @dev Removes asset from sender's account liquidity calculation.
     *
     * Sender must not have an outstanding borrow balance in the asset,
     * or be providing necessary collateral for an outstanding borrow.
     */
    function exitMarket(address _fToken) external override {
        ITokenBase fToken = ITokenBase(_fToken);

        /// Get fToken balance and amount of underlying asset borrowed
        (uint256 oErr, uint256 tokensHeld, uint256 amountOwed, ) = fToken
            .getAccountSnapshot(msg.sender);
        require(oErr == 0, "exitMarket: getAccountSnapshot failed"); // semi-opaque error code
        // Fail if the sender has a borrow balance
        require(amountOwed != 0, "RiskManager: Borrow balance is not zero");

        // Fail if the sender is not permitted to redeem all of their tokens
        uint256 allowed = redeemAllowed(cTokenAddress, msg.sender, tokensHeld);
        require(allowed == 0, "RiskManager: Cannot withdrawa all tokens");

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
    function setPendingAdmin(address _newPendingAdmin)
        external
        override
        onlyAdmin
    {
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
    function acceptAdmin() external override {
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

    /**
     * @notice Sets the collateralFactor for a market
     * @dev Admin function to set per-market collateralFactor
     * @param _fToken The market to set the factor on
     * @param _newCollateralFactorMantissa The new collateral factor, scaled by 1e18
     * @return uint 0=success, otherwise a failure. (See ErrorReporter for details)
     */
    function setCollateralFactor(
        address _fToken,
        uint256 _newCollateralFactorMantissa
    ) external onlyAdmin onlyListed(_fToken) {
        Market storage market = markets[address(cToken)];

        Exp memory newCollateralFactorExp = Exp({
            mantissa: _newCollateralFactorMantissa
        });

        // Check collateral factor <= 0.9
        Exp memory limit = Exp({mantissa: collateralFactorMaxMantissa});
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
        market.collateralFactorMantissa = newCollateralFactorMantissa;

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
    function supportMarket(address _fToken, uint256 _tier) external onlyAdmin {
        require(
            !markets[_fToken].isListed,
            "RiskManager: Market already listed"
        );
        require(_tier <= maxTier, "RiskManager: Invalid tier");

        ITokenBase(_fToken).isFToken(); // Sanity check to make sure its really a CToken

        Market storage newMarket = markets[_fToken];
        newMarket.isListed = true;
        newMarket.collateralFactorMantissa = 0;
        newMarket.tier = _tier;

        emit MarketListed(_fToken);
    }

    function setMintPaused(address _fToken, bool _state)
        external
        onlyListed
        onlyAdmin
        returns (bool)
    {
        mintGuardianPaused[_fToken] = _state;
        emit ActionPaused(_fToken, "Mint", _state);
        return _state;
    }

    function setBorrowPaused(address _fToken, bool _state)
        external
        onlyListed
        onlyAdmin
        returns (bool)
    {
        borrowGuardianPaused[_fToken] = _state;
        emit ActionPaused(_fToken, "Borrow", _state);
        return _state;
    }

    function setTransferPaused(bool state) external onlyAdmin returns (bool) {
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
     * @dev Checks if the account should be allowed to supply tokens in the given market.
     */
    function supplyAllowed(address _fToken) external view returns (bool) {
        // Pausing is a very serious situation - we revert to sound the alarms
        require(!mintGuardianPaused[cToken], "RiskManager: Minting is paused");

        return true;
    }

    /**
     * @dev Checks if the account should be allowed to redeem fTokens for underlying asset in the given market.
     * @param _redeemToken Amount of fTokens used for redemption.
     */
    function redeemAllowed(
        address _fToken,
        address _redeemer,
        uint256 _redeemToken
    ) external view onlyListed(_fToken) returns (bool) {
        // Can freely redeem if redeemer never entered market, as liquidity calculation is not affected
        if (!markets[_fToken].isMember[_redeemer]) {
            return true;
        }

        // Otherwise, perform a hypothetical liquidity check to guard against shortfall
        (, uint256 shortfall) = getHypotheticalAccountLiquidity(
            redeemer,
            _fToken,
            redeemTokens,
            0
        );
        require(shortfall == 0, "RiskManager: Insufficient liquidity");

        return true;
    }

    /**
     * @notice Checks if the account should be allowed to borrow the underlying asset of the given market.
     * @param _fToken The market to verify the borrow against.
     * @param _borrower The account which would borrow the asset.
     * @param _borrowAmount The amount of underlying the account would borrow.
     */
    function borrowAllowed(
        address _fToken,
        address _borrower,
        uint256 _borrowAmount
    ) external override onlyListed(_fToken) returns (bool) {
        // Pausing is a very serious situation - we revert to sound the alarms
        require(!borrowGuardianPaused[cToken], "RiskManager: Borrow is paused");

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

        (, uint256 shortfall) = getHypotheticalAccountLiquidityInternal(
            borrower,
            _fToken,
            0,
            borrowAmount
        );
        require(shortfall == 0, "RiskManager: Insufficient liquidity");

        return true;
    }

    /**
     * @notice Checks if the account should be allowed to repay a borrow in the given market
     * @param _fToken The market to verify the repay against
     *
     * NOTE: Only checks if the market is listed.
     */
    function repayBorrowAllowed(address _fToken)
        external
        override
        onlyListed(_fToken)
        returns (bool)
    {
        return true;
    }

    /**
     * @notice Checks if the liquidation should be allowed to occur
     * @param _fTokenBorrowed Asset which was borrowed by the borrower
     * @param _fTokenCollateral Asset which was used as collateral and will be seized
     * @param _liquidator The address repaying the borrow and seizing the collateral
     * @param _borrower The address of the borrower
     * @param _repayAmount The amount of underlying being repaid
     */
    function liquidateBorrowAllowed(
        address _fTokenBorrowed,
        address _fTokenCollateral,
        address _liquidator,
        address _borrower,
        uint256 _repayAmount
    ) external override returns (bool) {
        require(
            markets[_fTokenBorrowed].isListed ||
                markets[_fTokenCollateral].isListed,
            "RiskManager: Market is not listed"
        );

        uint256 borrowBalance = ITokenBase(_fTokenBorrowed).borrowBalanceStored(
            _borrower
        );

        /* The borrower must have shortfall in order to be liquidatable */
        (, uint256 shortfall) = getAccountLiquidity(_borrower);
        require(shortfall > 0, "RiskManager: Insufficient shortfall");

        /* The liquidator may not repay more than what is allowed by the closeFactor */
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
     * @param _liquidator The address repaying the borrow and seizing the collateral
     * @param _borrower The address of the borrower
     * @param _seizeTokens The number of collateral tokens to seize
     */
    function seizeAllowed(
        address _fTokenCollateral,
        address _fTokenBorrowed,
        address _liquidator,
        address _borrower
    ) external override returns (bool) {
        // Pausing is a very serious situation - we revert to sound the alarms
        require(!seizeGuardianPaused, "RiskManager: Seize is paused");

        require(
            markets[_fTokenBorrowed].isListed ||
                markets[_fTokenCollateral].isListed,
            "RiskManager: Market is not listed"
        );

        require(
            ITokenBase(_fTokenCollateral).riskManager() ==
                ITokenBase(_fTokenBorrowed).riskManager(),
            "RiskManager: Risk manager mismatch"
        );

        return true;
    }

    /**
     * @notice Checks if the account should be allowed to transfer tokens in the given market
     * @param _fToken The market to verify the transfer against
     * @param _src The account which sources the tokens
     * @param _dst The account which receives the tokens
     * @param _amount The number of fTokens to transfer
     */
    function transferAllowed(
        address _fToken,
        address _src,
        address _dst,
        uint256 _amount
    ) external override returns (bool) {
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

    /************************* Liquidity Calculations *************************/

    // See local var structure at { RiskManagerStorage } (Line 48-64)

    /**
     * @notice Determine the current account liquidity wrt collateral requirements
     * @return (hypothetical spare liquidity for each asset tier from low to high,
     *          account shortfall below collateral requirements)
     */
    function getAccountLiquidity(address _account, uint256 _tier)
        public
        view
        returns (uint256[] liquidities, uint256 shortfall)
    {
        // address(0) -> no iteractions with market
        (liquidities, shortfall) = getHypotheticalAccountLiquidity(
            _account,
            address(0),
            0,
            0
        );
    }

    /**
     * @notice Determine what the account liquidity would be if the given amounts were redeemed/borrowed
     * @param _account The account to determine liquidity for
     * @param _fToken The market to hypothetically redeem/borrow in
     * @param _redeemToken The number of fTokens to hypothetically redeem
     * @param _borrowAmount The amount of underlying to hypothetically borrow
     * @dev Note that we calculate the exchangeRateStored for each collateral cToken using stored data,
     *  without calculating accumulated interest.
     * @return (hypothetical spare liquidity for each asset tier from low to high,
     *          hypothetical account shortfall below collateral requirements)
     */
    function getHypotheticalAccountLiquidity(
        address _account,
        address _fToken,
        uint256 _redeemToken,
        uint256 _borrowAmount
    ) public view returns (uint256[] liquidities, uint256 shortfall) {
        // Holds all our calculation results
        AccountLiquidityLocalVars memory vars;

        // For each asset the account is in
        // Loop through to calculate colalteral and borrow values for each tier
        address[] memory assets = marketsEntered[account];
        for (uint256 i; i < assets.length; ) {
            address asset = assets[i];
            uint256 assetTier = markets[asset].tier;

            // Read the balances and exchange rate from the asset (market)
            (
                vars.tokenBalance,
                vars.borrowBalance,
                vars.exchangeRateMantissa
            ) = asset.getAccountSnapshot(_account);

            vars.collateralFactor = Exp({
                mantissa: markets[asset].collateralFactorMantissa
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

            vars
                .tierLiquidity[assetTier]
                .tierCollateralValue = mul_ScalarTruncateAddUInt(
                vars.tokenBalance,
                vars.collateralValuePerToken,
                vars.tierLiquidity[assetTier].tierCollateralValue
            );
            /*
            // sumCollateral += collateralValuePerToken * tokenBalance
            vars.sumCollateralValue = mul_ScalarTruncateAddUInt(
                vars.tokenBalance,
                vars.collateralValuePerToken,
                vars.sumCollateral
            );
            */

            vars
                .tierLiquidity[assetTier]
                .tierBorrowValue = mul_ScalarTruncateAddUInt(
                vars.borrowBalance,
                vars.oraclePrice,
                vars.tierLiquidity[assetTier].tierBorrowValue
            );
            /*
            // Add value already borrowed
            // sumBorrow += borrowBalance * oraclePrice
            vars.sumBorrowValue = mul_ScalarTruncateAddUInt(
                vars.oraclePrice,
                vars.borrowBalance,
                vars.sumBorrowPlusEffects
            );
            */

            // Calculate effects of interacting with fToken
            if (asset == _fToken) {
                // Redeem effect
                // sumBorrowPlusEffects += tokensToDenom * redeemTokens
                vars
                    .tierLiquidity[assetTier]
                    .tierCollateralValue = mul_ScalarTruncateSubUInt(
                    _redeemToken,
                    vars.collateralValuePerToken,
                    vars.tierLiquidity[assetTier].tierCollateralValue
                );

                // Add amount to hypothetically borrow
                // sumBorrowPlusEffects += oraclePrice * borrowAmount
                vars
                    .tierLiquidity[assetTier]
                    .tierBorrowValue = mul_ScalarTruncateAddUInt(
                    _borrowAmount,
                    vars.oraclePrice,
                    vars.tierLiquidity[assetTier].tierBorrowValue
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
        // e.g. First iteration (tempShortfall = 0):
        // isolation tier collateral > isolation tier borrow, push difference
        // to liquidities array; isolation collateral < isolation tier borrow,
        // add difference to `tempShortfall` and see if higher tier collaterals
        // can back all borrows.
        // Second iteration (Assume tempShortfall > 0):
        // cross-tier collateral > cross-tier borrow + tempShortfall, push difference
        // to liquidities array; cross-tier collateral < cross-tier borrow + tempShortfall,
        // accumulate tier shortfall to tempShortfall and see if there are enough
        // collateral tier collateral to back the total shortfall
        for (uint256 i = maxTier; i > 0; ) {
            uint256 collateral = vars.tierLiquidity[i].tierCollateralValue;
            uint256 borrow = vars.tierLiquidity[i].tierBorrowValue;
            uint256 threshold = borrow + vars.tempShortfall;

            if (collateral >= threshold) {
                liquidities.push(collateral - threshold);
                vars.tempShortfall = 0;
            } else {
                vars.tempShortfall += threshold - collateral;
            }

            unchecked {
                --i;
            }
        }

        // Return value
        shortfall = vars.tempShortfall;
    }
}
