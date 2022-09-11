// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "./tokens/interfaces/IFurionToken.sol";
import "./mock/MockUSD.sol";

import "./test-only/CoolCats.sol";

/**
 * @title  Claim necessary tokens for testing Furion
 * @notice We will mint sender specific amount of FurionToken, MockUSD, and NFTs
 */

contract TestClaim {
    // Furion has a total supply of 1 billion
    mapping(address => bool) public claimAlready;

    IFurionToken public furion;
    MockUSD public usd;
    CoolCats public coolCats;

    constructor(
        IFurionToken _furion,
        MockUSD _usd,
        CoolCats _coolCats
    ) {
        furion = _furion;
        usd = _usd;
        coolCats = _coolCats;
    }

    /**
     * @notice Claim testing tokens
     */
    function claimTest() external {
        // every account can only claim once
        require(!claimAlready[msg.sender], "HAVE_CLAIMED");

        furion.mintFurion(msg.sender, 10000 ether);
        usd.mint(msg.sender, 10000000000);
        coolCats.giveAway(msg.sender, 2);
    }
}
