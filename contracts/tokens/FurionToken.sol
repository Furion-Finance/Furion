// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract FurionToken is ERC20Permit {
    constructor() ERC20Permit("FurionToken") ERC20("FurionToken", "FUR") {}
}
