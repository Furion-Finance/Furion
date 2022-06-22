// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

interface IProjectPool is IERC721Receiver {
    function factory() external view returns (address);

    function mintAmount() external view returns (uint128);

    function initialize(address _nftAddress, address _tokenAddress) external;

    function stake(uint256 _id) external;

    function unstake(uint256 _id) external;

    function lock(uint256 _id) external;

    function unlock(uint256 _id) external;
}
