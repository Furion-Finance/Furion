// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ExponentialNoError.sol";
import "./interfaces/IRiskManager.sol";
import "./interfaces/IInterestRateModel.sol";
import "./interfaces/IPriceOracle.sol";

// name, symbol, decimals, totalSupply, balances, allowances in ERC20 contract
contract TokenBaseStorage is ExponentialNoError {
    bool public constant IS_FTOKEN = true;

    IRiskManager public riskManager;

    IInterestRateModel public interestRateModel;

    IPriceOracle public oracle;

    // Administrator for the market
    address public admin;

    // Pending administrator for the market
    address public pendingAdmin;

    // Max borrow rate per block (0.0005%)
    uint256 internal constant BORROW_RATE_MAX_MANTISSA = 5e12;

    // Maximum fraction of interest that can be set aside for reserves
    uint256 internal constant RESERVE_FACTOR_MAX_MANTISSA = 1e18; // 100%

    // 50 underlying = 1 fToken
    uint256 internal initialExchangeRateMantissa;

    uint256 public reserveFactorMantissa;

    // Block number that interest is last accrued at
    uint256 public lastAccrualBlock;

    // Accumulator for calculating interest
    uint256 public borrowIndex;

    uint256 public totalCash;

    uint256 public totalBorrows;

    uint256 public totalReserves;

    // Track user borrowing state
    struct BorrowSnapshot {
        // Borrow balance when last was made
        uint256 principal;
        // borrowIndex when last borrow was made
        uint256 interestIndex;
    }

    mapping(address => BorrowSnapshot) internal accountBorrows;

    // Percentage of seized tokens that goes to market reserve, 0 by default
    uint256 public protocolSeizeShareMantissa;

    struct LiquidationProtection {
        address borrower;
        address liquidator;
        uint128 value;
        uint128 tokenSeized;
    }

    // Block timestamp -> liquidation protectin detail
    mapping(uint256 => LiquidationProtection) liquidationProtection;
}

contract FErc20Storage {
    address public underlying;
}
