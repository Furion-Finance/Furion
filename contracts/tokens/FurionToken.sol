// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FurionToken is ERC20 {
    constructor() ERC20("Furion Token", "FUR") {}
}
