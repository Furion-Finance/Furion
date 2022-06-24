// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FurionFungibleToken is ERC20 {
    mapping(address => bool) public pools;

    constructor() ERC20("Furion Fungible Token", "FFT") {}

    modifier onlyPools() {
        require(pools[msg.sender] == true, "FFT: Not permitted to call.");
    }

    function mint(address _to, uint256 _amount) external onlyPools {
        _mint(_to, _amount);
    }

    function burn(address _burnFrom, uint256 _amount) external onlyPools {
        _burn(_burnFrom, _amount);
    }
}
