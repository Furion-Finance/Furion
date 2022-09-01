// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "./interfaces/IFurionToken.sol";
import "../utils/ERC20PermitWithMultipleMinters.sol";

/*
//===================================//
 ______ _   _______ _____ _____ _   _ 
 |  ___| | | | ___ \_   _|  _  | \ | |
 | |_  | | | | |_/ / | | | | | |  \| |
 |  _| | | | |    /  | | | | | | . ` |
 | |   | |_| | |\ \ _| |_\ \_/ / |\  |
 \_|    \___/\_| \_|\___/ \___/\_| \_/
//===================================//
* /

/**
 * @title  Furion Token
 * @notice FurionToken inherits from ERC20 Permit which contains the basic ERC20 implementation.
 *         FurionToken can use the permit function rather than approve + transferFrom.
 *
 *         FurionToken has an owner, a minterList and a burnerList.
 *         When lauched on mainnet, the owner may be removed or tranferred to a multisig.
 *         By default, the owner & the first minter will be the one that deploys the contract.
 *         The minterList should contain FarmingPool and PurchaseIncentiveVault.
 *         The burnerList should contain EmergencyPool.
 */
contract FurionToken is ERC20PermitWithMultipleMinters {
    // Furion has a total supply of 1 billion
    uint256 public constant CAP = 1e9 ether;

    /// @notice Indicator that it is one of the Furion Tokens
    bool public constant isFurionTokens = true;

    // ---------------------------------------------------------------------------------------- //
    // ************************************ Constructor *************************************** //
    // ---------------------------------------------------------------------------------------- //

    constructor() ERC20PermitWithMultipleMinters("FurionToken", "FUR") {}

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Modifiers **************************************** //
    // ---------------------------------------------------------------------------------------- //

    // Furion token has a hard cap of 1 billion
    modifier notExceedCap(uint256 _amount) {
        require(
            totalSupply() + _amount <= CAP,
            "Exceeds the FUR cap (1 billion)"
        );
        _;
    }

    // ---------------------------------------------------------------------------------------- //
    // *********************************** Main Functions ************************************* //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Mint Furion tokens
     * @param  _account Receiver's address
     * @param  _amount  Amount to be minted
     */
    function mintFurion(address _account, uint256 _amount)
        external
        notExceedCap(_amount)
    {
        mint(_account, _amount);
    }

    /**
     * @notice Burn Furion tokens
     * @param  _account Receiver's address
     * @param  _amount  Amount to be burned
     */
    function burnFurion(address _account, uint256 _amount) external {
        burn(_account, _amount);
    }
}
