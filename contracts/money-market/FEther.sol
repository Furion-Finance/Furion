// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./TokenBase.sol";

contract FEther is TokenBase {
    function initialize(address _riskManager, address _interestRateModel)
        public
        initializer
    {
        __TokenBase_init(
            _riskManager,
            _interestRateModel,
            "Furion Ether",
            "fETH"
        );
    }

    function doTransferIn(address _from, address _amount) internal override {
        require(msg.sender == _from, "FEther: Not owner of account");
        require(msg.value == _supplyAmount, "FEther: Not enough ETH supplied");
    }

    function doTransferOut(address payable _to, uint256 _amount)
        internal
        override
    {
        _to.transfer(_amount);
    }
}
