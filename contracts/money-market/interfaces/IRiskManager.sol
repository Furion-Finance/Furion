// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IRiskManager {
    /// @notice Emitted when an admin supports a market
    event MarketListed(address fToken);

    /// @notice Emitted when an account enters a market
    event MarketEntered(address fToken, address account);

    /// @notice Emitted when an account exits a market
    event MarketExited(address fToken, address account);

    /// @notice Emitted when a collateral factor is changed by admin
    event NewCollateralFactor(
        address fToken,
        uint256 oldCollateralFactorMantissa,
        uint256 newCollateralFactorMantissa
    );

    /// @notice Emitted when price oracle is changed
    event NewPriceOracle(address oldPriceOracle, address newPriceOracle);

    /// @notice Emitted when an action is paused globally
    event ActionPaused(string action, bool pauseState);

    /// @notice Emitted when an action is paused on a market
    event ActionPaused(address fToken, string action, bool pauseState);

    function enterMarkets(address[] memory _fTokens) external virtual;

    function exitMarket(address _fToken) external virtual;
}
