// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Checker is Ownable {
    // Project pool factory
    address public SP_FACTORY;
    // Root pool factory
    address public AP_FACTORY;

    mapping(address => bool) private isFurion;

    modifier callable() {
        require(
            msg.sender == owner() ||
                msg.sender == SP_FACTORY ||
                msg.sender == AP_FACTORY,
            "Checker: Not permitted to call."
        );
        _;
    }

    function isFurionToken(address _tokenAddress) public view returns (bool) {
        return isFurion[_tokenAddress];
    }

    function setSPFactory(address _spFactory) external onlyOwner {
        SP_FACTORY = _spFactory;
    }

    function setAPFactory(address _apFactory) external onlyOwner {
        AP_FACTORY = _apFactory;
    }

    function addToken(address _tokenAddress) external callable {
        isFurion[_tokenAddress] = true;
    }
}
