// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./FractionalAggregatePool.sol";
import "./interfaces/IFractionalAggregatePool.sol";
import "./interfaces/IAggregatePoolFactory.sol";
import "../IChecker.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract FractionalAggregatePoolFactory is Ownable {
    address public fur;
    address public oracle;
    address public immutable incomeMaker;
    address public immutable checker;
    address public immutable spFactory;

    // Starts from 0
    uint256 public nextId;
    // Pool ID to pool address
    mapping(uint256 => address) public getPool;
    //mapping(bytes32 => bool) private alreadyExist;

    // No use for now
    // address[] public allPools;

    event PoolCreated(address poolAddress, uint256 id);

    constructor(
        address _incomeMaker,
        address _checker,
        address _fur,
        address _oracle,
        address _spFactory
    ) {
        incomeMaker = _incomeMaker;
        checker = _checker;
        fur = _fur;
        oracle = _oracle;
        spFactory = _spFactory;
    }

    /**
     * @dev Get total number of root pools in existence
     */
    function allPoolsLength() external view returns (uint256) {
        return nextId;
    }

    /**
     * @dev Change owner/fee receiver for all project pools
     */
    function transferOwnership(address _newOwner) public override onlyOwner {
        require(
            _newOwner != address(0),
            "Ownable: New owner is the zero address"
        );

        _transferOwnership(_newOwner);

        // ID starts from 1
        for (uint256 i; i < nextId; ) {
            IFractionalAggregatePool(getPool[i]).changeOwner(_newOwner);

            unchecked {
                ++i;
            }
        }
    }

    function setFur(address _newFur) public onlyOwner {
        for (uint256 i; i < nextId; ) {
            IFractionalAggregatePool(getPool[i]).setFur(_newFur);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Initialize root pool and grant FFT minting and burning permissions
     *
     * @param _tokens Addresses of seaprate pools to be included in the aggregate pool
     */
    function createPool(
        address[] memory _tokens,
        string memory _name,
        string memory _symbol
    ) external returns (address poolAddress) {
        require(
            checker != address(0),
            "AggregatePoolFactory: Checker not set."
        );

        // Act as identifier for pools to ensure no duplications
        bytes32 _salt = keccak256(abi.encodePacked(_tokens));
        /*require(
            !alreadyExist[_salt],
            "AggregatePoolFactory: Root pool for these NFTs already exists."
        );*/
        poolAddress = address(
            new FractionalAggregatePool{salt: _salt}(
                incomeMaker,
                fur,
                oracle,
                spFactory,
                owner(),
                _tokens,
                string.concat("FurionFungibleToken ", _name),
                string.concat("FFT-", _symbol)
            )
        );

        getPool[nextId] = poolAddress;
        // Only tracks token list at the time of creation, useless
        //alreadyExist[_salt] = true;
        IChecker(checker).addToken(poolAddress);

        emit PoolCreated(poolAddress, nextId++);
    }
}
