// SPDX-License-Identifier: MIT

import "hardhat/console.sol";

pragma solidity ^0.8.0;

contract TransferNFT {
    address constant KITTIES = 0x06012c8cf97BEaD5deAe237070F9587f8E7A266d;
    address constant PUNKS = 0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB;

    function _transferInNFT(address _nft, uint256 _id) internal {
        bytes memory data;

        if (_nft == KITTIES) {
            // CryptoKitties
            data = abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                msg.sender,
                address(this),
                _id
            );
        } else if (_nft == PUNKS) {
            // CryptoPunks
            bytes memory punksIndexToOwner = abi.encodeWithSignature(
                "punkIndexToAddress(uint256)",
                _id
            );
            (bool _success, bytes memory result) = _nft.staticcall(
                punksIndexToOwner
            );
            address punkOwner = abi.decode(result, (address));
            require(
                _success && punkOwner == msg.sender,
                "Punk ownership check failed"
            );
            data = abi.encodeWithSignature("buyPunk(uint256)", _id);
        } else {
            // ERC 721
            data = abi.encodeWithSignature(
                "safeTransferFrom(address,address,uint256)",
                msg.sender,
                address(this),
                _id
            );
        }

        (bool success, bytes memory returnData) = _nft.call(data);
        require(success, string(returnData));
    }

    function _transferOutNFT(
        address _nft,
        address _dst,
        uint256 _id
    ) internal {
        bytes memory data;

        if (_nft == KITTIES) {
            // CryptoKitties
            data = abi.encodeWithSignature(
                "transfer(address,uint256)",
                _dst,
                _id
            );
        } else if (_nft == PUNKS) {
            // CryptoPunks
            data = abi.encodeWithSignature(
                "transferPunk(address,uint256)",
                _dst,
                _id
            );
        } else {
            // ERC 721
            data = abi.encodeWithSignature(
                "safeTransferFrom(address,address,uint256)",
                address(this),
                _dst,
                _id
            );
        }

        (bool success, bytes memory returnData) = _nft.call(data);
        require(success, string(returnData));
    }

    function _balanceOfNFT(address _nft, address _owner)
        internal
        view
        returns (uint256)
    {
        bytes memory data = abi.encodeWithSignature(
            "balanceOf(address)",
            _owner
        );

        (bool success, bytes memory returnData) = _nft.staticcall(data);
        require(success, string(returnData));

        return abi.decode(returnData, (uint256));
    }
}
