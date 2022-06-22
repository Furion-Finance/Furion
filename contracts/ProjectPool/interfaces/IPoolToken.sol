// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPoolToken is IERC20 {
    function initialize(
        address _nftAddress,
        address _poolAddress,
        string memory _tokenName,
        string memory _tokenSymbol
    ) external;

    function mint(address _to, uint256 _amount) external;

    function burn(address _burnFrom, uint256 _amount) external;
}
