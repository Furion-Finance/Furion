// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import "./TokenStorages.sol";
import "./interfaces/ITokenBase.sol";
import "./interfaces/IRiskManager.sol";
import "./interfaces/IInterestRateModel.sol";

contract TokenBase is ERC20PermitUpgradeable, TokenBaseStorage, ITokenBase {
    function __TokenBase_init(
        address _riskManager,
        address _interestRateModel,
        string memory _name,
        string memory _symbol
    ) internal onlyInitializing {
        __ERC20Permit_init(_name);
        __ERC20_init(_name, _symbol);

        require(
            IRiskManager(_riskManager).IS_RISK_MANAGER(),
            "TokenBase: Not risk manager contract"
        );
        riskManager = IRiskManager(_riskManager);

        lastAccrualBlock = block.number;
        borrowIndex = 1e18;

        require(
            IInterestRateModel.IS_INTEREST_RATE_MODEL(),
            "TokenBase: Not interst rate model contract"
        );
        interestRateModel = IInterestRateModel(_interestRateModel);

        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized to call");
        _;
    }

    /********************************* Admin **********************************/

    /**
     * @notice Begins transfer of admin rights. The newPendingAdmin MUST call
     *    `acceptAdmin` to finalize the transfer.
     * @dev Admin function to begin change of admin. The newPendingAdmin MUST
     *    call `acceptAdmin` to finalize the transfer.
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

    /********************************** Core **********************************/

    /**
     * @notice Get the underlying balance
     * @dev This also accrues interest in a transaction
     * @param _account The address of the account to query
     * @return The amount of underlying underlying asset
     */
    function balanceOfUnderlying(address _account)
        external
        override
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
        override
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        return (
            balanceOf(_account),
            borrowBalance(_account),
            exchangeRateStoredInternal()
        );
    }

    /**
     * @notice Returns the current per-block borrow interest rate for this cToken
     * @return The borrow interest rate per block, scaled by 1e18
     */
    function borrowRatePerBlock() external view override returns (uint256) {
        return
            interestRateModel.getBorrowRate(
                getCashPrior(),
                totalBorrows,
                totalReserves
            );
    }

    /**
     * @notice Returns the current per-block supply interest rate for this cToken
     * @return The supply interest rate per block, scaled by 1e18
     */
    function supplyRatePerBlock() external view override returns (uint256) {
        return
            interestRateModel.getSupplyRate(
                getCashPrior(),
                totalBorrows,
                totalReserves,
                reserveFactorMantissa
            );
    }

    /**
     * @notice Returns the current total borrows plus accrued interest
     * @return The total borrows with interest
     */
    function totalBorrowsCurrent() external override returns (uint256) {
        accrueInterest();
        return totalBorrows;
    }

    /**
     * @notice Return the borrow balance of account based on stored data
     * @param _account The address whose balance should be calculated
     * @return The calculated balance
     */
    function borrowBalance(address _account) public returns (uint256) {
        // Update market state
        accrueInterest();

        /* Get borrowBalance and borrowIndex */
        BorrowSnapshot storage borrowSnapshot = accountBorrows[account];

        /* If borrowBalance = 0 then borrowIndex is likely also 0.
         * Rather than failing the calculation with a division by 0, we immediately return 0 in this case.
         */
        if (borrowSnapshot.principal == 0) {
            return 0;
        }

        /* Calculate new borrow balance using the interest index:
         *  principal * how much borrowIndex has increased
         */
        return (principal * borrowIndex) / borrowSnapshot.interestIndex;
    }

    /**
     * @notice Calculates the exchange rate from the underlying to the fToken
     * @dev This function does not accrue interest before calculating the exchange rate
     * @return calculated exchange rate scaled by 1e18
     */
    function exchangeRate() internal virtual returns (uint256) {
        // Update market state
        accrueInterest();

        uint256 _totalSupply = totalSupply;
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
            uint256 totalCash = getCashPrior();
            uint256 cashPlusBorrowsMinusReserves = totalCash +
                totalBorrows -
                totalReserves;
            uint256 exchangeRate = (cashPlusBorrowsMinusReserves * expScale) /
                _totalSupply;

            return exchangeRate;
        }
    }

    /**
     * @notice Applies accrued interest to total borrows and reserves
     * @dev This calculates interest accrued from the last checkpointed block
     *    up to the current block and writes new checkpoint to storage.
     */
    function accrueInterest() public virtual override {
        /* Remember the initial block number */
        uint256 currentBlockNumber = block.number;
        uint256 _lastAccrualBlock = lastAccrualBlock;

        /* Short-circuit accumulating 0 interest */
        if (_lastAccrualBlock == currentBlockNumber) {
            return;
        }

        /* Read the previous values out of storage */
        uint256 cashPrior = getCash();
        uint256 borrowsPrior = totalBorrows;
        uint256 reservesPrior = totalReserves;
        uint256 borrowIndexPrior = borrowIndex;

        /* Calculate the current borrow interest rate */
        uint256 borrowRatePerBlockMantissa = interestRateModel.getBorrowRate(
            cashPrior,
            borrowsPrior,
            reservesPrior
        );
        require(
            borrowRateMantissa <= borrowRateMaxMantissa,
            "borrow rate is absurdly high"
        );

        /* Calculate the number of blocks elapsed since the last accrual */
        uint256 blockDelta = currentBlockNumber - _lastAccrualBlock;

        /*
         * Calculate the interest accumulated into borrows and reserves and the new index:
         *  simpleInterestFactor = borrowRate * blockDelta
         *  interestAccumulated = simpleInterestFactor * totalBorrows
         *  totalBorrowsNew = interestAccumulated + totalBorrows
         *  totalReservesNew = interestAccumulated * reserveFactor + totalReserves
         *  borrowIndexNew = simpleInterestFactor * borrowIndex + borrowIndex
         */

        Exp memory simpleInterestFactor = mul_(
            Exp({mantissa: borrowRateMantissa}),
            blockDelta
        );
        uint256 interestAccumulated = mul_ScalarTruncate(
            simpleInterestFactor,
            borrowsPrior
        );
        uint256 totalBorrowsNew = interestAccumulated + borrowsPrior;
        uint256 totalReservesNew = mul_ScalarTruncateAddUInt(
            Exp({mantissa: reserveFactorMantissa}),
            interestAccumulated,
            reservesPrior
        );
        uint256 borrowIndexNew = mul_ScalarTruncateAddUInt(
            simpleInterestFactor,
            borrowIndexPrior,
            borrowIndexPrior
        );

        /////////////////////////
        // EFFECTS & INTERACTIONS
        // (No safe failures beyond this point)

        /* We write the previously calculated values into storage */
        accrualBlockNumber = currentBlockNumber;
        borrowIndex = borrowIndexNew;
        totalBorrows = totalBorrowsNew;
        totalReserves = totalReservesNew;

        /* We emit an AccrueInterest event */
        emit AccrueInterest(
            cashPrior,
            interestAccumulated,
            borrowIndexNew,
            totalBorrowsNew
        );
    }

    /**
     * @notice User supplies assets into the market and receives cTokens in exchange
     * @dev Assumes interest has already been accrued up to the current block
     * @param _supplyAmount The amount of the underlying asset to supply
     */
    function supplyInternal(address _supplier, uint256 _supplyAmount) internal {
        // Update market state
        accrueInterest();

        require(
            riskManager.supplyAllowed(address(this), _supplier, _supplyAmount),
            "TokenBase: Supply disallowed by risk manager"
        );
        // Ensure market state is up to date
        require(
            lastAccrualBlock == block.number,
            "TokenBase: Market state not yet updated"
        );

        Exp memory exchangeRate = Exp({mantissa: exchangeRate()});

        /////////////////////////
        // EFFECTS & INTERACTIONS
        // (No safe failures beyond this point)

        /*
         *  We call `doTransferIn` giving the supplier and the supplyAmount.
         *  Note: The fToken must handle variations between ERC-20 and ETH underlying.
         *  `doTransferIn` reverts if anything goes wrong, since we can't be sure if
         *  side-effects occurred. On success, the fToken (market) holds
         *  an additional `_supplyAmount` of cash.
         */
        doTransferIn(_supplier, _supplyAmount);

        /*
         * We get the current exchange rate and calculate the number of cTokens to be minted:
         *  mintTokens = actualMintAmount / exchangeRate
         */

        uint256 mintTokens = div_(_supplyAmount, exchangeRate);
        _mint(_supplier, mintTokens);

        /* We emit a Mint event, and a Transfer event */
        emit Mint(_supplier, _supplyAmount, mintTokens);
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
        // Update market state
        accrueInterest();

        require(
            redeemTokensIn == 0 || redeemAmountIn == 0,
            "TokenBase: One of redeemTokens or redeemAmount must be zero"
        );

        Exp memory exchangeRate = Exp({mantissa: exchangeRate()});

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
        // Ensure market is up to date
        require(
            lastAccrualBlock == block.number,
            "TokenBase: Market state not yet updated"
        );
        // Fail gracefully if protocol has insufficient cash
        require(
            getCash() > redeemAmount,
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
     * @param borrowAmount The amount of the underlying asset to borrow
     */
    function borrowInternal(address _borrower, uint256 _borrowAmount) internal {
        // Update market state
        accrueInterest();

        require(
            riskManager.borrowAllowed(address(this), _borrower, _borrowAmount),
            "TokenBase: Borrow disallowed by risk manager"
        );
        // Ensure market is up to date
        require(
            lastAccrualBlock == block.number,
            "TokenBase: Market state not yet updated"
        );
        // Fail gracefully if protocol has insufficient cash
        require(
            getCash() > redeemAmount,
            "TokenBase: Market has insufficient cash"
        );

        // We calculate the new borrower and total borrow balances, failing on overflow
        uint256 borrowBalancePrev = borrowBalance(_borrower);
        uint256 borrowBalanceNew = borrowBalance + borrowAmount;
        uint256 totalBorrowsNew = totalBorrows + borrowAmount;

        /////////////////////////
        // EFFECTS & INTERACTIONS
        // (No safe failures beyond this point)

        /*
         * We write the previously calculated values into storage.
         *  Note: Avoid token reentrancy attacks by writing increased borrow before external transfer.
        `*/
        accountBorrows[_borrower].principal = borrowBalanceNew;
        accountBorrows[_borrower].interestIndex = borrowIndex;
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
     * @param payer the account paying off the borrow
     * @param borrower the account with the debt being payed off
     * @param repayAmount the amount of underlying tokens being returned, or -1 for the full outstanding amount
     * @return (uint) the actual repayment amount.
     */
    function repayBorrowInternal(
        address _payer,
        address _borrower,
        uint256 _repayAmount
    ) internal {
        // Update market state
        accrueInterest();

        require(
            riskManager.repayBorrowAllowed(
                address(this),
                _payer,
                _borrower,
                _repayAmount
            )
        );
        // Ensure market is up to date
        require(
            lastAccrualBlock == block.number,
            "TokenBase: Market state not yet updated"
        );

        // We fetch the amount the borrower owes, with accumulated interest
        uint256 borrowBalancePrev = borrowBalance(_borrower);

        // If repayAmount == max value of uint256, repay total amount owed,
        // else repay given amount
        uint256 actualRepayAmount = _repayAmount == type(uint256).max
            ? borrowBalancePrev
            : _repayAmount;

        /////////////////////////
        // EFFECTS & INTERACTIONS
        // (No safe failures beyond this point)

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
        uint256 borrowBalanceNew = borrowBalancePrev - actualRepayAmount;
        uint256 totalBorrowsNew = totalBorrows - actualRepayAmount;

        /* We write the previously calculated values into storage */
        accountBorrows[borrower].principal = borrowBalanceNew;
        accountBorrows[borrower].interestIndex = borrowIndex;
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

    /***************************** ERC20 Override *****************************/

    /**
     * @dev ERC20 internal transfer funtion with risk manager trasfer check
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[from];
        require(
            fromBalance >= amount,
            "ERC20: transfer amount exceeds balance"
        );
        // Risk manager transferAllowed
        require(
            riskManager.trasnferAllowed(),
            "TokenBase: Transfer disallowed by risk manager"
        );
        unchecked {
            _balances[from] = fromBalance - amount;
            // Overflow not possible: the sum of all balances is capped by totalSupply, and the sum is preserved by
            // decrementing then incrementing.
            _balances[to] += amount;
        }

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    /******************************* Safe Token *******************************/

    // Functions with different logics for ERC20 tokens and ETH

    /**
     * @notice Gets balance of this contract in terms of the underlying
     * @dev This excludes the value of the current message, if any
     * @return The quantity of underlying owned by this contract
     */
    function getCash() public view virtual returns (uint256);

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
