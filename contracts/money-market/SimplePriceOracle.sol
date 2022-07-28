// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IPriceOracle.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "./interfaces/IFErc20.sol";

contract SimplePriceOracle is IPriceOracle {
    mapping(address => uint256) prices;
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

    function getUnderlyingPrice(address _fToken)
        public
        view
        override
        returns (uint256)
    {
        return prices[_getUnderlyingAddress(_fToken)];
    }

    function setUnderlyingPrice(
        address _fToken,
        uint256 _underlyingPriceMantissa
    ) public {
        address asset = _getUnderlyingAddress(_fToken);
        emit PricePosted(
            asset,
            prices[asset],
            _underlyingPriceMantissa,
            _underlyingPriceMantissa
        );
        prices[asset] = _underlyingPriceMantissa;
    }

    function setDirectPrice(address _asset, uint256 _price) public {
        emit PricePosted(_asset, prices[_asset], _price, _price);
        prices[_asset] = _price;
    }

    // v1 price oracle interface for use as backing of proxy
    function assetPrices(address _asset) external view returns (uint256) {
        return prices[_asset];
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
