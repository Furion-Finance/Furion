// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

interface IProjectPool is IERC721Receiver {
    function factory() external view returns (address);

    function owner() external view returns (address);

    function changeOwner(address _newOwner) external;

    function sell(uint256 _id) external;

    function buy(uint256 _id) external;

    function lock(uint256 _id) external;

    function redeem(uint256 _id) external;

    function release(uint256 _id) external;
}
