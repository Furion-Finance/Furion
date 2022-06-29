// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
                                     
interface IFurionSwapV2ERC20 is IERC20, IERC20Permit {
    // ---------------------------------------------------------------------------------------- //
    // *************************************** Functions ************************************** //
    // ---------------------------------------------------------------------------------------- //
    
    /**
     * @notice Mint Furion native tokens
     * @param  _account Receiver's address
     * @param  _amount Amount to be minted
     */
    function mintFurion(address _account, uint256 _amount) external;

    /**
     * @notice Burn Furion native tokens
     * @param  _account Receiver's address
     * @param  _amount Amount to be burned
     */
    function burnFurion(address _account, uint256 _amount) external;
}
