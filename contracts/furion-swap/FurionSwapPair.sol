// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import {Math} from "../libraries/Math.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "../utils/ReentrancyGuard.sol";
import {IFurionSwapFactory} from "./interfaces/IFurionSwapFactory.sol";

/*
//===================================//
 ______ _   _______ _____ _____ _   _ 
 |  ___| | | | ___ \_   _|  _  | \ | |
 | |_  | | | | |_/ / | | | | | |  \| |
 |  _| | | | |    /  | | | | | | . ` |
 | |   | |_| | |\ \ _| |_\ \_/ / |\  |
 \_|    \___/\_| \_|\___/ \___/\_| \_/
//===================================//
* /

/**
 * @title  FurionSwap Pair
 * @notice This is the contract for the FurionSwap swapping pair.
 *         Every time a new pair of tokens is available on FurionSwap
 *         The contract will be initialized with two tokens and a deadline.
 *         The swaps are only availale before the deadline.
 */

contract FurionSwapPair is ERC20("Furion Swap Pool LP", "FSL"), ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Variables **************************************** //
    // ---------------------------------------------------------------------------------------- //

    // Minimum liquidity locked
    uint256 public constant MINIMUM_LIQUIDITY = 10 ** 3;

    // FurionSwapFactory contract address
    address public factory;

    // Token addresses in the pool, here token0 < token1
    address public token0;
    address public token1;

    uint private reserve0;
    uint private reserve1;

    // Fee Rate, given to LP holders (0 ~ 1000)
    uint256 public feeRate = 3;

    // reserve0 * reserve1
    uint256 public kLast;

    // ---------------------------------------------------------------------------------------- //
    // *************************************** Events ***************************************** //
    // ---------------------------------------------------------------------------------------- //

    event ReserveUpdated(uint256 reserve0, uint256 reserve1);
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );

    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    event Burn(
        address indexed sender,
        uint256 amount0,
        uint256 amount1,
        address indexed to
    );

    constructor() {
        factory = msg.sender; // deployed by factory contract
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************ Init Functions ************************************ //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Initialize the contract status after the deployment by factory
     * @param _tokenA TokenA address
     * @param _tokenB TokenB address
     */
    function initialize(
        address _tokenA,
        address _tokenB
    ) external {
        require(
            msg.sender == factory,
            "can only be initialized by the factory contract"
        );
        (token0, token1) = _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA);
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************ View Functions ************************************ //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Get reserve0 and reserve1
     * @dev The result will depend on token orders
     * @return _reserve0 Reserve of token0
     * @return _reserve1 Reserve of token1
     */
    function getReserves()
        public
        view
        returns (uint _reserve0, uint _reserve1)
    {
        (_reserve0, _reserve1) = (reserve0, reserve1);
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************ Main Functions ************************************ //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Mint LP Token to liquidity providers
     *         Called when adding liquidity.
     * @param _to The user address
     * @return liquidity The LP token amount
     */
    function mint(address _to)
        external
        nonReentrant
        returns (uint256 liquidity)
    {
        (uint _reserve0, uint _reserve1) = getReserves(); // gas savings

        uint256 balance0 = IERC20(token0).balanceOf(address(this)); // token0 balance after deposit
        uint256 balance1 = IERC20(token1).balanceOf(address(this)); // token1 balance after deposit

        uint256 amount0 = balance0 - _reserve0; // just deposit
        uint256 amount1 = balance1 - _reserve1;

        // Distribute part of the fee to income maker
        bool feeOn = _mintFee(_reserve0, _reserve1);

        uint256 _totalSupply = totalSupply(); // gas savings

        if (_totalSupply == 0) {
            // No liquidity = First add liquidity
            liquidity = Math.sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            // Keep minimum liquidity to this contract
            _mint(factory, MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
        } else {
            liquidity = min(
                (amount0 * _totalSupply) / _reserve0,
                (amount1 * _totalSupply) / _reserve1
            );
        }

        require(liquidity > 0, "insufficient liquidity minted");
        _mint(_to, liquidity);

        _update(balance0, balance1);

        if (feeOn) kLast = reserve0 * reserve1;

        emit Mint(msg.sender, amount0, amount1);
    }

    /**
     * @notice Burn LP tokens give back the original tokens
     * @param _to User address
     * @return amount0 Amount of token0 to be sent back
     * @return amount1 Amount of token1 to be sent back
     */
    function burn(address _to)
        external
        nonReentrant
        returns (uint256 amount0, uint256 amount1)
    {
        address _token0 = token0;
        address _token1 = token1;

        uint256 balance0 = IERC20(_token0).balanceOf(address(this));
        uint256 balance1 = IERC20(_token1).balanceOf(address(this));

        uint256 liquidity = balanceOf(address(this));

        bool feeOn = _mintFee(reserve0, reserve1);

        uint256 _totalSupply = totalSupply(); // gas savings

        // How many tokens to be sent back
        amount0 = (liquidity * balance0) / _totalSupply;
        amount1 = (liquidity * balance1) / _totalSupply;

        require(amount0 > 0 && amount1 > 0, "Insufficient liquidity burned");

        // Currently all the liquidity in the pool was just sent by the user, so burn all
        _burn(address(this), liquidity);

        // Transfer tokens out and update the balance
        IERC20(_token0).safeTransfer(_to, amount0);
        IERC20(_token1).safeTransfer(_to, amount1);
        balance0 = IERC20(_token0).balanceOf(address(this));
        balance1 = IERC20(_token1).balanceOf(address(this));

        _update(balance0, balance1);

        if (feeOn) kLast = reserve0 * reserve1;

        emit Burn(msg.sender, amount0, amount1, _to);
    }

    /**
     * @notice Finish the swap process
     * @param _amount0Out Amount of token0 to be given out (may be 0)
     * @param _amount1Out Amount of token1 to be given out (may be 0)
     * @param _to Address to receive the swap result
     */
    function swap(
        uint256 _amount0Out,
        uint256 _amount1Out,
        address _to
    ) external nonReentrant {
        require(
            _amount0Out > 0 || _amount1Out > 0,
            "Output amount need to be positive"
        );

        (uint _reserve0, uint _reserve1) = getReserves(); // gas savings
        require(
            _amount0Out < _reserve0 && _amount1Out < _reserve1,
            "Not enough liquidity"
        );

        uint256 balance0;
        uint256 balance1;
        {
            // scope for _token{0,1}, avoids stack too deep errors
            address _token0 = token0;
            address _token1 = token1;
            require(_to != _token0 && _to != _token1, "INVALID_TO");

            if (_amount0Out > 0) IERC20(_token0).safeTransfer(_to, _amount0Out);
            if (_amount1Out > 0) IERC20(_token1).safeTransfer(_to, _amount1Out);

            balance0 = IERC20(_token0).balanceOf(address(this));
            balance1 = IERC20(_token1).balanceOf(address(this));
        }
        uint256 amount0In = balance0 > _reserve0 - _amount0Out
            ? balance0 - (_reserve0 - _amount0Out)
            : 0;
        uint256 amount1In = balance1 > _reserve1 - _amount1Out
            ? balance1 - (_reserve1 - _amount1Out)
            : 0;

        require(amount0In > 0 || amount1In > 0, "INSUFFICIENT_INPUT_AMOUNT");

        {
            uint256 balance0Adjusted = balance0 * 1000 - amount0In * feeRate;
            uint256 balance1Adjusted = balance1 * 1000 - amount1In * feeRate;

            require(
                balance0Adjusted * balance1Adjusted >=
                    _reserve0 * _reserve1 * (1000**2),
                "The remaining x*y is less than K"
            );
        }

        _update(balance0, balance1);

        emit Swap(
            msg.sender,
            amount0In,
            amount1In,
            _amount0Out,
            _amount1Out,
            _to
        );
    }

    /**
     * @notice Syncrinize the status of this pool
     */
    function sync() external nonReentrant {
        _update(
            IERC20(token0).balanceOf(address(this)),
            IERC20(token1).balanceOf(address(this))
        );
    }

    // ---------------------------------------------------------------------------------------- //
    // ********************************** Internal Functions ********************************** //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Update the reserves of the pool
     * @param balance0 Balance of token0
     * @param balance1 Balance of token1
     */
    function _update(uint256 balance0, uint256 balance1) private {
        uint MAX_NUM = type(uint).max;
        require(balance0 <= MAX_NUM && balance1 <= MAX_NUM, "uint OVERFLOW");

        reserve0 = uint(balance0);
        reserve1 = uint(balance1);

        emit ReserveUpdated(reserve0, reserve1);
    }

    /**
     * @notice Collect the income sharing from trading pair
     * @param _reserve0 Reserve of token0
     * @param _reserve1 Reserve of token1
     */
    function _mintFee(uint _reserve0, uint _reserve1)
        private
        returns (bool feeOn)
    {
        address incomeMaker = IFurionSwapFactory(factory).incomeMaker();

        // If incomeMaker is not zero address, fee is on
        feeOn = incomeMaker != address(0);

        uint256 _k = kLast;

        if (feeOn) {
            if (_k != 0) {
                uint256 rootK = Math.sqrt(_reserve0 * _reserve1);
                uint256 rootKLast = Math.sqrt(_k);

                if (rootK > rootKLast) {
                    uint256 numerator = totalSupply() *
                        (rootK - rootKLast) *
                        10;

                    // (1 / φ) - 1
                    // Proportion got from factory is based on 100
                    // Use 1000/proportion to make it divided (donominator and numerator both * 10)
                    // p = 40 (2/5) => 1000/40 = 25
                    uint256 incomeMakerProportion = IFurionSwapFactory(factory)
                        .incomeMakerProportion();
                    uint256 denominator = rootK *
                        (1000 / incomeMakerProportion - 100) +
                        rootKLast *
                        100;

                    uint256 liquidity = numerator / denominator;

                    // Mint the liquidity to income maker contract
                    if (liquidity > 0) _mint(incomeMaker, liquidity);
                }
            }
        } else if (_k != 0) {
            kLast = 0;
        }
    }

    /**
     * @notice Get the smaller one of two numbers
     * @param x The first number
     * @param y The second number
     * @return z The smaller one
     */
    function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = x < y ? x : y;
    }
}
