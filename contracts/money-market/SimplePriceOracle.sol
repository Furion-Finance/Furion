// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IPriceOracle.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "./interfaces/IFErc20.sol";

contract SimplePriceOracle is IPriceOracle {
    mapping(address => uint256) prices;
    // e.g. A token with 18 decimals, decimals[asset] = 1e18, NOT 18
    mapping(address => uint256) decimals;
    event PricePosted(
        address asset,
        uint256 previousPriceMantissa,
        uint256 requestedPriceMantissa,
        uint256 newPriceMantissa
    );

    function _getUnderlyingAddress(address _fToken)
        private
        view
        returns (address asset)
    {
        if (
            compareStrings(IERC20MetadataUpgradeable(_fToken).symbol(), "fETH")
        ) {
            asset = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
        } else {
            asset = IFErc20(_fToken).getUnderlying();
        }
    }

    // Price of 1, not 1e18, underlying token in terms of ETH (mantissa)
    function getUnderlyingPrice(address _fToken)
        public
        view
        override
        returns (uint256, uint256)
    {
        address asset = _getUnderlyingAddress(_fToken);
        return (prices[asset], decimals[asset]);
    }

    function setUnderlyingPrice(
        address _fToken,
        uint256 _underlyingPriceMantissa,
        uint256 _decimal
    ) public {
        address asset = _getUnderlyingAddress(_fToken);
        emit PricePosted(
            asset,
            prices[asset],
            _underlyingPriceMantissa,
            _underlyingPriceMantissa
        );
        prices[asset] = _underlyingPriceMantissa;
        decimals[asset] = _decimal;
    }

    function setDirectPrice(
        address _asset,
        uint256 _price,
        uint256 _decimal
    ) public {
        emit PricePosted(_asset, prices[_asset], _price, _price);
        prices[_asset] = _price;
        decimals[_asset] = _decimal;
    }

    // v1 price oracle interface for use as backing of proxy
    function assetPrices(address _asset)
        external
        view
        returns (uint256, uint256)
    {
        return (prices[_asset], decimals[_asset]);
    }

    function compareStrings(string memory _a, string memory _b)
        internal
        pure
        returns (bool)
    {
        return (keccak256(abi.encodePacked((_a))) ==
            keccak256(abi.encodePacked((_b))));
    }
}
