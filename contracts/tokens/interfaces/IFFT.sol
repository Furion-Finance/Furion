// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IFFT {
    function addRootPool(address _poolAddress) external;

    function mint(address _to, uint256 _amount) external;

    function burn(address _burnFrom, uint256 _amount) external;
}
