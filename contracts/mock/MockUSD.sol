// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @notice This is the MockUSD for test
 */
contract MockUSD is ERC20 {
    constructor(string memory _name, string memory _symbol)
        ERC20(_name, _symbol)
    {
        // When first deployed, give the owner some coins
        _mint(msg.sender, 100000 * 1e6);
    }

    // Everyone can mint
    function mint(address _account, uint256 _amount) public {
        _mint(_account, _amount);
    }

    // 6 decimals to mock stablecoins
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
