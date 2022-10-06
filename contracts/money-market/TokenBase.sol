// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import "./TokenStorages.sol";
import "./interfaces/ITokenBase.sol";
import "./interfaces/IRiskManager.sol";
import "./interfaces/IInterestRateModel.sol";
import "./interfaces/IPriceOracle.sol";
import "./interfaces/IFErc20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../IChecker.sol";
import "hardhat/console.sol";

abstract contract TokenBase is
    ERC20PermitUpgradeable,
    TokenBaseStorage,
    ITokenBase
{
    function __TokenBase_init(
        address _riskManager,
        address _interestRateModel,
        address _priceOracle,
        address _checker,
        string memory _name,
        string memory _symbol
    ) internal onlyInitializing {
        __ERC20Permit_init(_name);
        __ERC20_init(_name, _symbol);

        require(
            IRiskManager(_riskManager).isRiskManager(),
            "TokenBase: Not risk manager contract"
        );
        riskManager = IRiskManager(_riskManager);

        lastAccrualBlock = block.number;
        borrowIndex = 1e18;

        require(
            IInterestRateModel(_interestRateModel).isInterestRateModel(),
            "TokenBase: Not interst rate model contract"
        );
        interestRateModel = IInterestRateModel(_interestRateModel);

        oracle = IPriceOracle(_priceOracle);

        checker = IChecker(_checker);

        initialExchangeRateMantissa = 50e18;

        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized to call");
        _;
    }

    /********************************* Admin **********************************/

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

    function setReserveFactor(uint256 _newReserveFactorMantissa)
        external
        onlyAdmin
    {
        (uint256 borrows, uint256 reserves, uint256 index) = accrueInfo();
        accrueInterest(index);
        totalBorrows = borrows;
        totalReserves = reserves;

        require(
            _newReserveFactorMantissa < RESERVE_FACTOR_MAX_MANTISSA,
            "TokenBase: Invalid reserve factor"
        );

        uint256 oldReserveFactorMantissa = reserveFactorMantissa;
        reserveFactorMantissa = _newReserveFactorMantissa;

        emit NewReserveFactor(
            oldReserveFactorMantissa,
            _newReserveFactorMantissa
        );
    }

    function setPriceOracle(address _newOracle) external onlyAdmin {
        address oldOracle = address(oracle);

        oracle = IPriceOracle(_newOracle);

        emit NewPriceOracle(oldOracle, _newOracle);
    }

    /********************************** Core **********************************/

    function isFToken() public pure returns (bool) {
        return IS_FTOKEN;
    }

    function getLastAccrualBlock() public view returns (uint256) {
        return lastAccrualBlock;
    }

    function getRiskManager() public view returns (address) {
        return address(riskManager);
    }

    /**
     * @notice Get the underlying balance
     * @dev This also accrues interest in a transaction
     * @param _account The address of the account to query
     * @return The amount of underlying underlying asset
     */
    function balanceOfUnderlying(address _account)
        public
        view
        returns (uint256)
    {
        Exp memory exchangeRate = Exp({mantissa: exchangeRateCurrent()});
        return mul_ScalarTruncate(exchangeRate, balanceOf(_account));
    }

    /**
     * @notice Get a snapshot of the account's balances, and the cached exchange rate
     * @dev This is used by comptroller to more efficiently perform liquidity checks.
     * @param _account Address of the account to snapshot
     * @return (token balance, borrow balance, exchange rate mantissa)
     */
    function getAccountSnapshot(address _account)
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        (uint256 borrows, uint256 reserves, uint256 index) = accrueInfo();

        return (
            balanceOf(_account),
            borrowBalanceCalc(_account, index),
            exchangeRateCalc(borrows, reserves)
        );
    }

    /**
     * @notice Returns the current per-block borrow interest rate for this cToken
     * @return The borrow interest rate per block, scaled by 1e18
     */
    function borrowRatePerBlock() external view override returns (uint256) {
        (uint256 borrows, uint256 reserves, ) = accrueInfo();

        return interestRateModel.getBorrowRate(totalCash, borrows, reserves);
    }

    /**
     * @notice Returns the current per-block supply interest rate for this cToken
     * @return The supply interest rate per block, scaled by 1e18
     */
    function supplyRatePerBlock() external view override returns (uint256) {
        (uint256 borrows, uint256 reserves, ) = accrueInfo();

        return
            interestRateModel.getSupplyRate(
                totalCash,
                borrows,
                reserves,
                reserveFactorMantissa
            );
    }

    /**
     * @notice Returns the current total borrows plus accrued interest
     * @return The total borrows with interest
     */
    function totalBorrowsCurrent() public view returns (uint256) {
        (uint256 borrows, , ) = accrueInfo();

        return borrows;
    }

    function borrowBalanceCurrent(address _account)
        public
        view
        returns (uint256)
    {
        (, , uint256 index) = accrueInfo();

        // Get borrowBalance and borrowIndex
        BorrowSnapshot memory snapshot = accountBorrows[_account];

        /* If borrowBalance = 0 then borrowIndex is likely also 0.
         * Rather than failing the calculation with a division by 0, we immediately
         * return 0 in this case.
         */
        if (snapshot.principal == 0) {
            return 0;
        }

        /* Calculate new borrow balance using the interest index:
         *  principal * how much borrowIndex has increased
         */
        return (snapshot.principal * index) / snapshot.interestIndex;
    }

    /**
     * @notice Return the borrow balance of account based on stored data
     * @param _account The address whose balance should be calculated
     * @return The calculated balance
     *
     * NOTE: Despite being free to call, it may not be accurate when called externally
     * by non-Furion contracts because lastAccrualBlock will not be equal to current
     * block number provided that accrueInterest() is not called beforehand, meaning
     * that market is not up-to-date when the function is called. Call 'current' version
     * functions for accurate results.
     */
    function borrowBalanceCalc(address _account, uint256 _index)
        internal
        view
        returns (uint256)
    {
        // Get borrowBalance and borrowIndex
        BorrowSnapshot memory snapshot = accountBorrows[_account];

        /* If borrowBalance = 0 then borrowIndex is likely also 0.
         * Rather than failing the calculation with a division by 0, we immediately
         * return 0 in this case.
         */
        if (snapshot.principal == 0) {
            return 0;
        }

        /* Calculate new borrow balance using the interest index:
         *  principal * how much borrowIndex has increased
         */
        return (snapshot.principal * _index) / snapshot.interestIndex;
    }

    /**
     * @notice Exchange rate of current block
     */
    function exchangeRateCurrent() public view returns (uint256) {
        (uint256 borrows, uint256 reserves, ) = accrueInfo();

        uint256 _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            /*
             * If there are no tokens minted:
             *  exchangeRate = initialExchangeRate
             */
            return initialExchangeRateMantissa;
        } else {
            /*
             * Otherwise:
             *  exchangeRate = (totalCash + totalBorrows - totalReserves) / totalSupply
             */
            uint256 cashPlusBorrowsMinusReserves = totalCash +
                borrows -
                reserves;
            uint256 exchangeRate = (cashPlusBorrowsMinusReserves * expScale) /
                _totalSupply;

            return exchangeRate;
        }
    }

    /**
     * @notice Calculated exchange rate based on given params
     */
    function exchangeRateCalc(uint256 _borrows, uint256 _reserves)
        internal
        view
        returns (uint256)
    {
        uint256 _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            /*
             * If there are no tokens minted:
             *  exchangeRate = initialExchangeRate
             */
            return initialExchangeRateMantissa;
        } else {
            /*
             * Otherwise:
             *  exchangeRate = (totalCash + totalBorrows - totalReserves) / totalSupply
             */
            uint256 cashPlusBorrowsMinusReserves = totalCash +
                _borrows -
                _reserves;
            uint256 exchangeRate = (cashPlusBorrowsMinusReserves * expScale) /
                _totalSupply;

            return exchangeRate;
        }
    }

    /**
     * @notice CALCULATE market info of current block
     * @return New total borrow, new total reserve, new borrow index
     */
    function accrueInfo()
        internal
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        uint256 borrows = totalBorrows;
        uint256 reserves = totalReserves;
        uint256 index = borrowIndex;
        uint256 blockDelta = block.number - lastAccrualBlock;

        if (blockDelta > 0) {
            uint256 borrowsPrior = borrows;
            uint256 reservesPrior = reserves;
            uint256 indexPrior = index;

            // Calculate the current borrow interest rate
            uint256 borrowRatePerBlockMantissa = interestRateModel
                .getBorrowRate(totalCash, borrowsPrior, reservesPrior);
            require(
                borrowRatePerBlockMantissa <= BORROW_RATE_MAX_MANTISSA,
                "TokenBase: Borrow rate is absurdly high"
            );

            /*
             * Calculate the interest accumulated into borrows and reserves and the new index:
             *  simpleInterestFactor = borrowRate * blockDelta
             *  interestAccumulated = simpleInterestFactor * totalBorrows
             *  totalBorrowsNew = interestAccumulated + totalBorrows
             *  totalReservesNew = interestAccumulated * reserveFactor + totalReserves
             *  borrowIndexNew = simpleInterestFactor * borrowIndex + borrowIndex
             */

            Exp memory simpleInterestFactor = mul_(
                Exp({mantissa: borrowRatePerBlockMantissa}),
                blockDelta
            );
            index = mul_ScalarTruncateAddUInt(
                simpleInterestFactor,
                indexPrior,
                indexPrior
            );

            // Need to use the same method used to calculate borrow balance (i.e. multiply
            // by how much borrowIndex increased) of an account to prevent mismatch due
            // to roudings during arithmetic operations
            borrows = (borrows * index) / indexPrior;
            uint256 interestAccumulated = borrows - borrowsPrior;
            reserves = mul_ScalarTruncateAddUInt(
                Exp({mantissa: reserveFactorMantissa}),
                interestAccumulated,
                reservesPrior
            );
        }

        return (borrows, reserves, index);
    }

    /**
     * @notice Update borrow index to keep track of interest accumulation
     * @dev Called in all market actions. Borrows and reserves are updated separately
     *  only when borrowing / repaying to save gas
     */
    function accrueInterest(uint256 _borrowIndex) internal {
        if (lastAccrualBlock == block.number) {
            return;
        }

        // We write the calculated values into storage
        borrowIndex = _borrowIndex;
        lastAccrualBlock = block.number;
    }

    /**
     * @notice User supplies assets into the market and receives cTokens in exchange
     * @dev Assumes interest has already been accrued up to the current block
     * @param _supplyAmount The amount of the underlying asset to supply
     */
    function supplyInternal(address _supplier, uint256 _supplyAmount) internal {
        (uint256 borrows, uint256 reserves, uint256 index) = accrueInfo();
        accrueInterest(index);

        require(
            riskManager.supplyAllowed(address(this)),
            "TokenBase: Supply disallowed by risk manager"
        );

        // Get current exchange rate
        Exp memory exchangeRate = Exp({
            mantissa: exchangeRateCalc(borrows, reserves)
        });

        /*
         *  We call `doTransferIn` giving the supplier and the supplyAmount.
         *  Note: The fToken must handle variations between ERC-20 and ETH underlying.
         *  `doTransferIn` reverts if anything goes wrong, since we can't be sure if
         *  side-effects occurred. On success, the fToken (market) holds
         *  an additional `_supplyAmount` of cash.
         */
        doTransferIn(_supplier, _supplyAmount);

        // We get the current exchange rate and calculate the number of cTokens to be minted         */
        uint256 mintTokens = div_(_supplyAmount, exchangeRate);
        _mint(_supplier, mintTokens);

        /* We emit a Supply event, and a Transfer event */
        emit Supply(_supplier, _supplyAmount, mintTokens);
    }

    /**
     * @notice User redeems cTokens in exchange for the underlying asset
     * @dev Assumes interest has already been accrued up to the current block
     * @param _redeemer The address of the account which is redeeming the tokens
     * @param _redeemTokens The number of fTokens to redeem into underlying
     * @param _redeemAmount The number of underlying tokens to receive from redeeming fTokens
     */
    function redeemInternal(
        address _redeemer,
        uint256 _redeemTokens,
        uint256 _redeemAmount
    ) internal {
        (uint256 borrows, uint256 reserves, uint256 index) = accrueInfo();
        accrueInterest(index);

        require(
            _redeemTokens == 0 || _redeemAmount == 0,
            "TokenBase: One of redeemTokens or redeemAmount must be zero"
        );

        // Get current exchange rate
        Exp memory exchangeRate = Exp({
            mantissa: exchangeRateCalc(borrows, reserves)
        });

        uint256 redeemTokens;
        uint256 redeemAmount;
        // Calculate amount that can be redeemed given tokens supplied OR
        // tokens needed for redeeming the given amount of underlying asset
        if (_redeemTokens > 0) {
            redeemTokens = _redeemTokens;
            redeemAmount = mul_ScalarTruncate(exchangeRate, _redeemTokens);
        } else {
            redeemTokens = div_(_redeemAmount, exchangeRate);
            redeemAmount = _redeemAmount;
        }

        require(
            riskManager.redeemAllowed(address(this), _redeemer, redeemTokens),
            "TokenBase: Redeem disallowed by risk manager"
        );
        // Fail gracefully if protocol has insufficient cash
        require(
            totalCash > redeemAmount,
            "TokenBase: Market has insufficient cash"
        );

        /////////////////////////
        // EFFECTS & INTERACTIONS
        // (No safe failures beyond this point)

        _burn(_redeemer, redeemTokens);

        /*
         * We invoke doTransferOut for the redeemer and the redeemAmount.
         *  Note: The cToken must handle variations between ERC-20 and ETH underlying.
         *  On success, the cToken has redeemAmount less of cash.
         *  doTransferOut reverts if anything goes wrong, since we can't be sure if side effects occurred.
         */
        doTransferOut(payable(_redeemer), redeemAmount);

        emit Redeem(_redeemer, redeemAmount, redeemTokens);
    }

    /**
     * @notice Users borrow assets from the protocol to their own address
     * @param _borrowAmount The amount of the underlying asset to borrow
     */
    function borrowInternal(address _borrower, uint256 _borrowAmount) internal {
        (uint256 borrows, , uint256 index) = accrueInfo();
        accrueInterest(index);

        require(
            riskManager.borrowAllowed(address(this), _borrower, _borrowAmount),
            "TokenBase: Borrow disallowed by risk manager"
        );
        // Fail gracefully if protocol has insufficient cash
        require(
            totalCash > _borrowAmount,
            "TokenBase: Market has insufficient cash"
        );

        // We calculate the new borrower and total borrow balances, failing on overflow
        uint256 borrowBalanceNew = borrowBalanceCalc(_borrower, index) +
            _borrowAmount;
        uint256 totalBorrowsNew = borrows + _borrowAmount;

        /////////////////////////
        // EFFECTS & INTERACTIONS
        // (No safe failures beyond this point)

        /*
         * We write the previously calculated values into storage.
         *  Note: Avoid token reentrancy attacks by writing increased borrow before external transfer.
        `*/
        accountBorrows[_borrower].principal = borrowBalanceNew;
        accountBorrows[_borrower].interestIndex = index;
        totalBorrows = totalBorrowsNew;

        /*
         * We invoke doTransferOut for the borrower and the borrowAmount.
         *  Note: The cToken must handle variations between ERC-20 and ETH underlying.
         *  On success, the cToken borrowAmount less of cash.
         *  doTransferOut reverts if anything goes wrong, since we can't be sure if side effects occurred.
         */
        doTransferOut(payable(_borrower), _borrowAmount);

        /* We emit a Borrow event */
        emit Borrow(
            _borrower,
            _borrowAmount,
            borrowBalanceNew,
            totalBorrowsNew
        );
    }

    /**
     * @notice Borrows are repaid by another user (possibly the borrower).
     * @param _payer the account paying off the borrow
     * @param _borrower the account with the debt being payed off
     * @param _repayAmount the amount of underlying tokens being returned, or -1 for the full outstanding amount
     */
    function repayBorrowInternal(
        address _payer,
        address _borrower,
        uint256 _repayAmount
    ) internal {
        (uint256 borrows, , uint256 index) = accrueInfo();
        accrueInterest(index);

        require(
            riskManager.repayBorrowAllowed(address(this)),
            "TokenBase: Repay disallowed by risk manager"
        );

        // We fetch the amount the borrower owes, with accumulated interest
        uint256 borrowBalancePrev = borrowBalanceCalc(_borrower, index);

        // If repayAmount == max value of uint256, repay total amount owed,
        // else repay given amount
        uint256 actualRepayAmount = _repayAmount == type(uint256).max
            ? borrowBalancePrev
            : _repayAmount;

        /*
         * We call doTransferIn for the payer and the repayAmount
         *  Note: The cToken must handle variations between ERC-20 and ETH underlying.
         *  On success, the cToken holds an additional repayAmount of cash.
         *  doTransferIn reverts if anything goes wrong, since we can't be sure if side effects occurred.
         *   it returns the amount actually transferred, in case of a fee.
         */
        doTransferIn(_payer, actualRepayAmount);

        /*
         * We calculate the new borrower and total borrow balances, failing on underflow:
         *  accountBorrowsNew = accountBorrows - actualRepayAmount
         *  totalBorrowsNew = totalBorrows - actualRepayAmount
         */
        uint256 borrowBalanceNew = actualRepayAmount > borrowBalancePrev
            ? 0
            : borrowBalancePrev - actualRepayAmount;
        uint256 totalBorrowsNew = actualRepayAmount > borrows
            ? 0
            : borrows - actualRepayAmount;

        /* We write the previously calculated values into storage */
        accountBorrows[_borrower].principal = borrowBalanceNew;
        accountBorrows[_borrower].interestIndex = index;
        totalBorrows = totalBorrowsNew;

        /* We emit a RepayBorrow event */
        emit RepayBorrow(
            _payer,
            _borrower,
            actualRepayAmount,
            borrowBalanceNew,
            totalBorrowsNew
        );
    }

    /**
     * @notice The liquidator liquidates the borrower's collateral.
     *  The collateral seized is transferred to the liquidator.
     * @param _borrower The borrower of this fToken to be liquidated
     * @param _liquidator The address repaying the borrow and seizing collateral
     * @param _repayAmount The amount of the underlying borrowed asset to repay
     * @param _fTokenCollateral The market in which to seize collateral from the borrower
     */
    function liquidateBorrowInternal(
        address _liquidator,
        address _borrower,
        uint256 _repayAmount,
        address _fTokenCollateral
    ) internal {
        (, , uint256 index) = accrueInfo();
        accrueInterest(index);

        ITokenBase collateral = ITokenBase(_fTokenCollateral);

        /* Fail if liquidate not allowed */
        require(
            riskManager.liquidateBorrowAllowed(
                address(this),
                _fTokenCollateral,
                _borrower,
                _repayAmount
            ),
            "TokenBase: Liquidation disallowed by risk manager"
        );
        // Ensure collateral market is also up-to-date
        require(
            collateral.getLastAccrualBlock() == block.number,
            "TokenBase: Collateral market state not yet updated"
        );
        // Fail if borrower = liquidator
        require(
            _borrower != _liquidator,
            "TokenBase: Cannot liquidate yourself"
        );
        // Fail if repayAmount = 0 or -1
        require(
            _repayAmount > 0 && _repayAmount != type(uint256).max,
            "TokenBase: Invalid repay amount"
        );

        // Fail if repayBorrow fails
        repayBorrowInternal(_liquidator, _borrower, _repayAmount);

        /**
         * Call seize functions of fTokenCollateral contract for token seizure.
         * If this is also the collateral, run seizeInternal to avoid re-entrancy,
         * otherwise make an external call
         */
        if (_fTokenCollateral == address(this)) {
            seizeInternal(address(this), _liquidator, _borrower, _repayAmount);
        } else {
            collateral.seize(_liquidator, _borrower, _repayAmount);
        }

        // Reset liquidation tracker if there are no more bad debts
        riskManager.closeLiquidation(_borrower);

        // We emit a LiquidateBorrow event
        emit LiquidateBorrow(
            _liquidator,
            _borrower,
            _repayAmount,
            _fTokenCollateral
        );
    }

    /**
     * @notice Transfers collateral tokens (this market) to the liquidator.
     * @dev Called only during an in-kind liquidation, or by liquidateBorrow during
     *  the liquidation of another fToken. Its absolutely critical to use msg.sender
     *  as the seizer fToken and not a parameter.
     * @param _seizer The contract calling the function for seizing the collateral
     *   (i.e. borrowed fToken)
     * @param _liquidator The account receiving seized collateral
     * @param _borrower The account having collateral seized
     * @param _repayAmount Amount of underlying tokens of seizer market the liquidator paid
     */
    function seizeInternal(
        address _seizer,
        address _liquidator,
        address _borrower,
        uint256 _repayAmount
    ) internal {
        (, , uint256 index) = accrueInfo();
        accrueInterest(index);

        // We calculate the number of collateral tokens that will be seized
        (uint256 seizeTotal, uint256 repayValue) = riskManager
            .liquidateCalculateSeizeTokens(
                _borrower,
                _seizer,
                address(this),
                _repayAmount
            );

        // Params: fTokenCollateral, fTokenBorrowed, liquidator, borrower
        (bool allowed, bool isCollateralTier) = riskManager.seizeAllowed(
            address(this),
            _seizer,
            _borrower,
            seizeTotal
        );
        require(allowed, "TokenBase: Token seizure disallowed by risk manager");

        // Fail if borrower = liquidator, already checked in `liquidaetBorrowInterna()`
        // require(borrower != liquidator);

        // Initiate liquidation protection if seized asset is collateral tier
        if (isCollateralTier && checker.isFurionToken(address(this))) {
            // Indirect token transfer through minting and burning
            _burn(_borrower, seizeTotal);
            // Store seized tokens in market contract
            _mint(address(this), seizeTotal);

            LiquidationProtection storage lp = liquidationProtection[
                block.timestamp
            ];
            lp.borrower = _borrower;
            lp.liquidator = _liquidator;
            lp.value = uint128(repayValue);
            lp.tokenSeized = uint128(seizeTotal);
        } else {
            (
                uint256 liquidatorSeizeTokens,
                uint256 protocolSeizeAmount,
                uint256 totalReservesNew
            ) = seizeAllocation(seizeTotal);

            // Indirect token transfer through minting and burning
            _burn(_borrower, seizeTotal);
            _mint(_liquidator, liquidatorSeizeTokens);
            // We write the calculated values into storage
            totalReserves = totalReservesNew;

            emit TokenSeized(_borrower, _liquidator, liquidatorSeizeTokens);
            emit ReservesAdded(
                address(this),
                protocolSeizeAmount,
                totalReservesNew
            );
        }
    }

    /**
     * @dev It is safe to set external visibility as seizeAllowed checks whether
     *  msg.sender is listed and has the same comptroller as current market (the
     *  market where tokens are seized)
     */
    function seize(
        address _liquidator,
        address _borrower,
        uint256 _repayAmount
    ) external {
        seizeInternal(msg.sender, _liquidator, _borrower, _repayAmount);
    }

    /**
     * @notice Calculate how much liquidators get as rewards and how much the market
     *  gets as reserves given amount of tokens seized
     */
    function seizeAllocation(uint256 _seizeTotal)
        internal
        view
        returns (
            uint256 liquidatorSeizeTokens,
            uint256 protocolSeizeAmount,
            uint256 totalReservesNew
        )
    {
        // mul_: uint, exp -> uint
        uint256 protocolSeizeTokens = mul_(
            _seizeTotal,
            Exp({mantissa: protocolSeizeShareMantissa})
        );

        liquidatorSeizeTokens = _seizeTotal - protocolSeizeTokens;

        // Convert amount of fToken for reserve to underlying asset
        Exp memory exchangeRate = Exp({mantissa: exchangeRateCurrent()});
        // mul_ScalarTruncate: exp, uint -> uint
        protocolSeizeAmount = mul_ScalarTruncate(
            exchangeRate,
            protocolSeizeTokens
        );

        totalReservesNew = totalReserves + protocolSeizeAmount;
    }

    /**
     * @notice Liquidators can claim seized tokens locked for liquidation protection
     *  if the liquidated account did not pay 1.2x to reclaim tokens after 24 hours
     *  of the liquidation.
     * @param _timestamp Block timestamp of when the protection is initiated
     */
    function claimLiquidation(uint256 _timestamp) external {
        LiquidationProtection memory lp = liquidationProtection[_timestamp];

        require(
            block.timestamp > _timestamp + 1 days,
            "TokenBase: Time limit not passed"
        );
        require(
            lp.value != 0,
            "TokenBase: Liquidation protection closed / never existed"
        );
        require(
            msg.sender == lp.liquidator,
            "TokenBase: Not liquidator of this liquidation"
        );

        uint256 tokenSeized256 = uint256(lp.tokenSeized);

        (
            uint256 liquidatorSeizeTokens,
            uint256 protocolSeizeAmount,
            uint256 totalReservesNew
        ) = seizeAllocation(tokenSeized256);

        // Indirect token transfer through minting and burning
        _burn(address(this), tokenSeized256);
        _mint(msg.sender, liquidatorSeizeTokens);
        // We write the calculated values into storage
        totalReserves = totalReservesNew;

        emit TokenSeized(lp.borrower, lp.liquidator, liquidatorSeizeTokens);
        emit ReservesAdded(
            address(this),
            protocolSeizeAmount,
            totalReservesNew
        );

        delete liquidationProtection[_timestamp];
    }

    /**
     * @notice Borrowers who get liquidated can reclaim the seized tokens if they
     *  pay 1.2x the amount liquidators repaid within 24 hours after liquidation.
     * @param _timestamp Block timestamp of when the protection is initiated
     *
     * NOTE: Unit for getUnderlyingPrice of price oracle is ETH, therefore no need
     * to query value.
     */
    function repayLiquidationWithEth(uint256 _timestamp) external payable {
        LiquidationProtection memory lp = liquidationProtection[_timestamp];

        require(
            block.timestamp < _timestamp + 1 days,
            "TokenBase: Time limit passed"
        );
        require(
            lp.value != 0,
            "TokenBase: Liquidation protection closed / never existed"
        );

        // 1.2x multiplier
        uint256 valueAfterMultiplier = (uint256(lp.value) * 120) / 100;

        require(
            msg.value >= valueAfterMultiplier,
            "TokenBase: Not enough ETH given"
        );

        uint256 spareEth = msg.value - valueAfterMultiplier;

        // Contract immediately transfers received ETH to liquidator
        payable(lp.liquidator).transfer(valueAfterMultiplier);
        // Refund spare ETH
        if (spareEth > 0) {
            payable(msg.sender).transfer(spareEth);
        }

        // Transfer collateral fToken to borrower (msg.sender)
        uint256 tokenSeized256 = uint256(lp.tokenSeized);
        _burn(address(this), tokenSeized256);
        _mint(lp.borrower, tokenSeized256);

        delete liquidationProtection[_timestamp];
    }

    /**
     * @notice Borrowers who get liquidated can reclaim the seized tokens if they
     *  pay 1.2x the amount liquidators repaid within 24 hours after liquidation.
     * @param _timestamp Block timestamp of when the protection is initiated
     * @param _fToken Address of market where the underlying asset is used for repaying
     */
    function repayLiquidationWithErc(uint256 _timestamp, address _fToken)
        external
    {
        LiquidationProtection memory lp = liquidationProtection[_timestamp];

        require(
            block.timestamp < _timestamp + 1 days,
            "TokenBase: Time limit passed"
        );
        require(
            riskManager.checkListed(_fToken),
            "TokenBase: Market not listed"
        );
        require(
            lp.value != 0,
            "TokenBase: Liquidation protection closed / never existed"
        );
        require(
            msg.sender == lp.borrower,
            "TokenBase: Not borrower of this liquidation"
        );

        // 1.2x multiplier
        uint256 valueAfterMultiplier = (uint256(lp.value) * 120) / 100;

        address underlyingAsset = IFErc20(_fToken).getUnderlying();
        (uint256 underlyingPriceMantissa, ) = oracle.getUnderlyingPrice(
            _fToken
        );
        // div_: uint, exp -> uint
        uint256 underlyingToRepay = div_(
            valueAfterMultiplier,
            Exp({mantissa: underlyingPriceMantissa})
        );

        // Pay liquidator
        IERC20(underlyingAsset).transferFrom(
            msg.sender,
            lp.liquidator,
            underlyingToRepay
        );

        // Transfer collateral fToken to borrower (msg.sender)
        uint256 tokenSeized256 = uint256(lp.tokenSeized);
        _burn(address(this), tokenSeized256);
        _mint(msg.sender, tokenSeized256);

        delete liquidationProtection[_timestamp];
    }

    /***************************** ERC20 Override *****************************/

    /**
     * Transferring invokes transferAllowed check which further invokes redeemAllowed
     * check. Therefore, market should be up-to-date before transfer to make sure
     * liquidity calculation in redeemAllowed is accurate.
     */

    /**
     * @dev ERC20 transfer funtions with risk manager trasfer check
     */
    function transfer(address to, uint256 amount)
        public
        override
        returns (bool)
    {
        (, , uint256 index) = accrueInfo();
        accrueInterest(index);

        address owner = _msgSender();
        // Risk manager transferAllowed
        require(
            riskManager.transferAllowed(address(this), owner, amount),
            "TokenBase: Transfer disallowed by risk manager"
        );

        _transfer(owner, to, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        (, , uint256 index) = accrueInfo();
        accrueInterest(index);

        // Risk manager transferAllowed
        require(
            riskManager.transferAllowed(address(this), from, amount),
            "TokenBase: Transfer disallowed by risk manager"
        );

        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    /******************************* Safe Token *******************************/

    // Functions with different logics for ERC20 tokens and ETH

    /**
     * @dev Performs a transfer in (transfer assets from caller to this contract), reverting upon failure. Returns the amount actually transferred to the protocol, in case of a fee.
     */
    function doTransferIn(address _from, uint256 _amount) internal virtual;

    /**
     * @dev Performs a transfer out, ideally returning an explanatory error code upon failure rather than reverting.
     *  If caller has not called checked protocol's balance, may revert due to insufficient cash held in the contract.
     *  If caller has checked protocol's balance, and verified it is >= amount, this should not revert in normal conditions.
     */
    function doTransferOut(address payable _to, uint256 _amount)
        internal
        virtual;
}
