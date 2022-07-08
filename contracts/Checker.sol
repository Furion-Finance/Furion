// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Checker is Ownable {
    // Project pool factory
    address public PP_FACTORY;
    // Root pool factory
    address public RP_FACTORY;

    mapping(address => bool) private isFurion;

    modifier callable() {
        require(
            msg.sender == owner() ||
                msg.sender == PP_FACTORY ||
                msg.sender == RP_FACTORY,
            "Checker: Not permitted to call."
        );
        _;
    }

    function isFurionToken(address _tokenAddress) public view returns (bool) {
        return isFurion[_tokenAddress];
    }

    function setPPFactory(address _ppFactory) external onlyOwner {
        PP_FACTORY = _ppFactory;
    }

    function setRPFactory(address _rpFactory) external onlyOwner {
        RP_FACTORY = _rpFactory;
    }

    function addToken(address _tokenAddress) external callable {
        isFurion[_tokenAddress] = true;
    }
}
