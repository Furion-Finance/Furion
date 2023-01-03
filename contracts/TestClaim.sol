// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./tokens/interfaces/IFurionToken.sol";

/**
 * @title  Claim necessary tokens for testing Furion
 * @notice We will mint sender specific amount of FurionToken, MockUSD, and NFTs
 */

contract TestClaim {
    address constant BAYC = 0x62681C8021a1f1C1C8DDba5992beB192bbBdF9BB;
    address constant MAYC = 0x10e4A7696B9120A1482958812b655d542b48C37a;
    address constant OTHERDEED = 0x3Ac6e1030d42AF70D7596EA1C51a563016B24AED;
    address constant BAKC = 0x9b6E64D58E815D54725eE97B1Ff1901a6F0dad99;
    address constant PUNKS = 0xa3430ccf668e6BF470eb11892B338ee9f3776AA3;
    address constant AZUKI = 0x334304e341ac6b4C8246F1F885eEc0C014a5337D;
    address constant DOODLES = 0x827cA7a1b2b0aaFAA84B74e432C89E8caafB2573;
    address constant MEEBITS = 0xc37aaA27F8E4674dADD3942e105bC1426bFe69fB;
    address constant GHOST = 0x4E56446A826FA74A10d03D182cC2047740965Fb9;
    address constant CATDDLE = 0xAE4753760AC717C2A05c517C201a9aB9ABF0E15C;
    address constant SHHANS = 0x3064232c2B96936274D9419fA1068dEE7446f249;
    address[] nfts = [
        MAYC,
        OTHERDEED,
        BAKC,
        PUNKS,
        AZUKI,
        DOODLES,
        MEEBITS,
        GHOST,
        CATDDLE,
        SHHANS
    ];
    address constant FUR = 0x167873d27d6f16C503A694814a3895215344B601;

    mapping(address => bool) public claimed;

    uint256 public counter = 0;

    /**
     * @notice Claim testing tokens
     */
    function claimTest() external returns (uint256) {
        // every account can only claim once
        require(!claimed[msg.sender], "Already claimed");

        claimed[msg.sender] = true;

        IFurionToken(FUR).mintFurion(msg.sender, 1000e18);

        bytes memory data;
        bool success;
        bytes memory returnData;

        data = abi.encodeWithSignature("mint(address,uint256)", msg.sender, 1);

        (success, returnData) = BAYC.call(data);
        require(success, string(returnData));

        uint256 randNft = counter % 10;
        (success, returnData) = nfts[randNft].call(data);
        require(success, string(returnData));

        counter++;

        // Return nft index for getting the corresponding image at front-end
        return randNft;
    }
}
