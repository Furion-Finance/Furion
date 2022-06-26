// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../tokens/interfaces/IFFT.sol";
import "./interfaces/IFurionOracle.sol";

contract RootPool {
    IFFT FFT;
    IFurionOracle oracle;

    address public factory;
    address public owner;

    // Accepted pool tokens for this root pool
    mapping(address => bool) poolTokens;

    constructor(
        address _fft,
        address _oracle,
        address _owner,
        address[] memory _poolTokens
    ) {
        factory = msg.sender;
        FFT = IFFT(_fft);
        oracle = IFurionOracle(_oracle);
        owner = _owner;

        for (uint256 i = 0; i < _poolTokens.length; ) {
            poolTokens[_poolTokens[i]] = true;

            unchecked {
                ++i;
            }
        }
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "");
        _;
    }

    modifier tokenRegistered(address _tokenAddress) {
        require(
            poolTokens[_tokenAddress] == true,
            "RootPool: Token not accepted in this pool."
        );
        _;
    }

    function changeOwner(address _newOwner) external onlyFactory {
        owner = _newOwner;
    }
}
