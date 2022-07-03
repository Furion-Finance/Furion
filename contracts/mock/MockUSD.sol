// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @notice This is the MockUSD for test
 */
contract MockUSD is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 100000 * 1e6;

    constructor() ERC20("MOCKUSD", "USDC") {
        // When first deployed, give the owner some coins
        _mint(msg.sender, INITIAL_SUPPLY);
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
