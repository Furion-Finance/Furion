// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract FurionOracle is Ownable {
    mapping(bytes32 => AggregatorV3Interface) priceFeed;

    mapping(address => uint256[]) public prices;

    // 0: Normal - 1: Mid - 2: Rare
    // NFT token address to token id to price
    mapping(address => mapping(uint256 => uint256)) public priceLevel;
    mapping(address => bytes32) public quoteToken;

    event PriceUpdated(address token, uint256 level, uint256 price);

    function setPriceFeed(string calldata _name, address _feed)
        external
        onlyOwner
    {
        bytes32 tokenId = keccak256(abi.encodePacked(_name));

        // Set price feed info
        priceFeed[tokenId] = AggregatorV3Interface(_feed);
    }

    function getNFTPrice(address _token, uint256 _id)
        external
        view
        returns (uint256 price)
    {
        uint256 level = getPriceLevel(_token, _id);

        return prices[_token][level];
    }

    function getPriceLevel(address _token, uint256 _id)
        public
        view
        returns (uint256)
    {
        return priceLevel[_token][_id];
    }

    // update price to all levels under certain token address
    function updatePrices(address _token, uint256[] memory _prices)
        public
        onlyOwner
    {
        uint256 length = prices[_token].length;

        require(length > 0, "Price not initialized");

        require(length == _prices.length, "Length mismatch");

        for (uint256 i; i < length; ) {
            prices[_token][i] = _prices[i];

            unchecked {
                ++i;
            }

            emit PriceUpdated(_token, i, _prices[i]);
        }
    }

    function initPrice(address _token, uint256 _levels) external onlyOwner {
        require(prices[_token].length == 0, "Already initialized");

        for (uint256 i; i < _levels; ) {
            prices[_token].push(0);
            unchecked {
                ++i;
            }
        }
    }

    function updatePrice(
        address _token,
        uint256 _level,
        uint256 _price
    ) public onlyOwner {
        require(prices[_token].length > 0, "Price not initialized");

        prices[_token][_level] = _price;
        emit PriceUpdated(_token, _level, _price);
    }

    function _getChainlinkPrice(bytes32 _id) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed[_id].latestRoundData();

        return uint256(price);
    }
}
