// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract FurionTokenTest is ERC20Permit {
    constructor(address[] memory _testers)
        ERC20Permit("FurionTokenTest")
        ERC20("FurionTokenTest", "FUR")
    {
        for (uint256 i = 0; i < _testers.length; ) {
            _mint(_testers[i], 1000 ether);

            unchecked {
                ++i;
            }
        }
    }
}
