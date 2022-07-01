// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract FurionFungibleToken is ERC20Permit {
    address public rootPoolFactory;

    mapping(address => bool) public rootPools;

    constructor(address _rootPoolFactory)
        ERC20Permit("FurionFungibleToken")
        ERC20("FurionFungibleToken", "FFT")
    {
        rootPoolFactory = _rootPoolFactory;
    }

    modifier onlyRootPools() {
        require(rootPools[msg.sender] == true, "FFT: Not permitted to call.");
        _;
    }

    modifier onlyRootPoolFactory() {
        require(msg.sender == rootPoolFactory, "FFT: Not permitted to call.");
        _;
    }

    function circulatingSupply() public view returns (uint256) {
        // Total supply - balance of all contracts that locked FFT
        // return totalSupply() - balanceOf()
        return totalSupply();
    }

    function addRootPool(address _poolAddress) external onlyRootPoolFactory {
        rootPools[_poolAddress] = true;
    }

    function mint(address _to, uint256 _amount) external onlyRootPools {
        _mint(_to, _amount);
    }

    function burn(address _burnFrom, uint256 _amount) external onlyRootPools {
        _burn(_burnFrom, _amount);
    }
}
