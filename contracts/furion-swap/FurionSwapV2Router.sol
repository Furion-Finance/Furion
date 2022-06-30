// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/IFurionSwapV2Router.sol";
import "./interfaces/IFurionSwapFactory.sol";
import "./interfaces/IFurionSwapPair.sol";
import {IERC20Decimals} from "../utils/interfaces/IERC20Decimals.sol";

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
 * @title  FurionSwapRouter
 * @notice Router for the pool, you can add/remove liquidity or swap A for B.
 *         Swapping fee rate is 3‰, 99% of them is given to LP, and 1% to income maker
 *         Very similar logic with Uniswap V2.
 *
 */

contract FurionSwapV2Router is IFurionSwapV2Router {

    using SafeERC20 for IERC20;
    using SafeERC20 for IFurionSwapPair;

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Variables **************************************** //
    // ---------------------------------------------------------------------------------------- //

    // Some other contracts
    address public immutable override factory;
    address public immutable override WETH;

    // ---------------------------------------------------------------------------------------- //
    // *************************************** Events ***************************************** //
    // ---------------------------------------------------------------------------------------- //

    event LiquidityAdded(
        address indexed pairAddress,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );

    event LiquidityRemoved(
        address indexed pairAddress,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );

    // ---------------------------------------------------------------------------------------- //
    // ************************************* Constructor ************************************** //
    // ---------------------------------------------------------------------------------------- //

    constructor(address _factory, address _weth) {
        factory = _factory;
        WETH = _weth;
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************** Modifiers *************************************** //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Transactions are available only before the deadline
     * @param _deadline Deadline of the pool
     */
    modifier beforeDeadline(uint256 _deadline) {
        if(_deadline > 0){
            if (msg.sender != IFurionSwapFactory(factory).incomeMaker()) {
                require(block.timestamp < _deadline, "expired transaction");
            }
        }
        _;
    }

    // ---------------------------------------------------------------------------------------- //
    // ************************************ Main Functions ************************************ //
    // ---------------------------------------------------------------------------------------- //

    receive() external payable {
        assert(msg.sender == WETH); // only accept ETH via fallback from the WETH contract
    }

    /**
     * @notice Add liquidity function
     * @param _tokenA Address of tokenA
     * @param _tokenB Address of tokenB
     * @param _amountADesired Amount of tokenA desired
     * @param _amountBDesired Amount of tokenB desired
     * @param _amountAMin Minimum amoutn of tokenA
     * @param _amountBMin Minimum amount of tokenB
     * @param _to Address that receive the lp token, normally the user himself
     * @param _deadline Transaction will revert after this deadline
     * @return amountA Amount of tokenA to be input
     * @return amountB Amount of tokenB to be input
     * @return liquidity LP token to be mint
     */
    function addLiquidity(
        address _tokenA,
        address _tokenB,
        uint _amountADesired,
        uint _amountBDesired,
        uint _amountAMin,
        uint _amountBMin,
        address _to,
        uint _deadline
    ) external beforeDeadline(_deadline) returns (uint amountA, uint amountB, uint liquidity) {

        (amountA, amountB) = _addLiquidity(
                _tokenA,
                _tokenB,
                _amountADesired,
                _amountBDesired,
                _amountAMin,
                _amountBMin
            );

        address pair = IFurionSwapFactory(factory).getPair(
            _tokenA,
            _tokenB
        );

        _transferHelper(_tokenA, msg.sender, pair, amountA);
        _transferHelper(_tokenB, msg.sender, pair, amountB);

        liquidity = IFurionSwapPair(pair).mint(_to);

        emit LiquidityAdded(pair, amountA, amountB, liquidity);
    }

    /**
     * @notice Add liquidity for pair where one token is ETH
     * @param _token Address of the other token
     * @param _amountTokenDesired Amount of token desired
     * @param _amountTokenMin Minimum amount of token
     * @param _amountETHMin Minimum amount of ETH
     * @param _to Address that receive the lp token, normally the user himself
     * @param _deadline Transaction will revert after this deadline
     * @return amountToken Amount of token to be input
     * @return amountETH Amount of ETH to be input
     * @return liquidity LP token to be mint
     */
    function addLiquidityETH(
        address _token,
        uint _amountTokenDesired,
        uint _amountTokenMin,
        uint _amountETHMin,
        address _to,
        uint _deadline
    ) external payable beforeDeadline(_deadline) returns (uint amountToken, uint amountETH, uint liquidity) {

        (amountToken, amountETH) = _addLiquidity(
            _token,
            WETH,
            _amountTokenDesired,
            msg.value,
            _amountTokenMin,
            _amountETHMin
        );

        address pair = IFurionSwapFactory(factory).getPair(
            _token,
            WETH
        );

        _transferHelper(_token, msg.sender, pair, amountToken);
        IWETH(WETH).deposit{value: amountETH}();
        assert(IWETH(WETH).transfer(pair, amountETH));

        liquidity = IFurionSwapPair(pair).mint(_to);

        // refund dust eth, if any
        if (msg.value > amountETH) _safeTransferETH(msg.sender, msg.value - amountETH);

        emit LiquidityAdded(pair, amountToken, amountETH, liquidity);
    }


    // ---------------------------------------------------------------------------------------- //
    // *********************************** Helper Functions *********************************** //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Fetch the reserves for a trading pair
     * @dev You need to sort the token order by yourself!
     *      No matter your input order, the return value will always start with lower address
     *      i.e. _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA)
     * @param _tokenA Address of tokenA
     * @param _tokenB Address of tokenB
     * @return reserve0 Reserve of token0,
     * @return reserve1 Reserve of token1
     */
    function getReserves(address _tokenA, address _tokenB)
        public
        view
        returns (uint112 reserve0, uint112 reserve1)
    {
        address pairAddress = IFurionSwapFactory(factory).getPair(
            _tokenA,
            _tokenB
        );

        // (token0 reserve, token1 reserve)
        (reserve0, reserve1) = IFurionSwapPair(pairAddress).getReserves();
    }

    /**
     * @notice Used when swap exact tokens for tokens (in is fixed)
     * @param _amountIn Amount of tokens put in
     * @param _tokenIn Address of the input token
     * @param _tokenOut Address of the output token
     * @return amountOut Amount of token out
     */
    function getAmountOut(
        uint256 _amountIn,
        address _tokenIn,
        address _tokenOut,
        uint256 _feeRate
    ) public view returns (uint256 amountOut) {
        (uint256 reserveA, uint256 reserveB) = getReserves(
            _tokenIn,
            _tokenOut
        );

        // Get the right order
        (uint256 reserveIn, uint256 reserveOut) = _tokenIn < _tokenOut
            ? (reserveA, reserveB)
            : (reserveB, reserveA);

        require(_amountIn > 0, "insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "insufficient liquidity");

        uint256 amountInWithFee = _amountIn * (1000 - _feeRate);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * 1000 + amountInWithFee;

        amountOut = numerator / denominator;
    }

    /**
     * @notice Used when swap tokens for exact tokens (out is fixed)
     * @param _amountOut Amount of tokens given out
     * @param _tokenIn Address of the input token
     * @param _tokenOut Address of the output token
     * @return amountIn Amount of token in
     */
    function getAmountIn(
        uint256 _amountOut,
        address _tokenIn,
        address _tokenOut,
        uint256 _feeRate
    ) public view returns (uint256 amountIn) {
        (uint256 reserveA, uint256 reserveB) = getReserves(
            _tokenIn,
            _tokenOut
        );

        // Get the right order
        (uint256 reserveIn, uint256 reserveOut) = _tokenIn < _tokenOut
            ? (reserveA, reserveB)
            : (reserveB, reserveA);

        require(_amountOut > 0, "insufficient output amount");
        require(reserveIn > 0 && reserveOut > 0, "insufficient liquidity");

        uint256 numerator = reserveIn * (_amountOut) * 1000;
        uint256 denominator = (reserveOut - _amountOut) * (1000 - _feeRate);

        amountIn = numerator / denominator + 1;
    }

    /**
     * @notice Given some amount of an asset and pair reserves
     *         returns an equivalent amount of the other asset
     * @dev Used when add or remove liquidity
     * @param _amountA Amount of tokenA
     * @param _reserveA Reserve of tokenA
     * @param _reserveB Reserve of tokenB
     * @return amountB Amount of tokenB
     */
    function quote(
        uint256 _amountA,
        uint256 _reserveA,
        uint256 _reserveB
    ) public pure returns (uint256 amountB) {
        require(_amountA > 0, "insufficient amount");
        require(_reserveA > 0 && _reserveB > 0, "insufficient liquidity");

        amountB = (_amountA * _reserveB) / _reserveA;
    }


    // ---------------------------------------------------------------------------------------- //
    // *********************************** Internal Functions ********************************* //
    // ---------------------------------------------------------------------------------------- //

    /**
     * @notice Internal function to finish adding liquidity
     * @param _tokenA Address of tokenA
     * @param _tokenB Address of tokenB
     * @param _amountADesired Amount of tokenA to be added
     * @param _amountBDesired Amount of tokenB to be added
     * @param _amountAMin Minimum amount of tokenA
     * @param _amountBMin Minimum amount of tokenB
     * @return amountA Real amount of tokenA
     * @return amountB Real amount of tokenB
     */
    function _addLiquidity(
        address _tokenA,
        address _tokenB,
        uint256 _amountADesired,
        uint256 _amountBDesired,
        uint256 _amountAMin,
        uint256 _amountBMin
    ) private view returns (uint256 amountA, uint256 amountB) {

        (uint256 reserve0, uint256 reserve1) = getReserves(_tokenA, _tokenB);
        (uint256 reserveA, uint256 reserveB) = _tokenA < _tokenB ? (reserve0, reserve1) : (reserve1, reserve0);

        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (_amountADesired, _amountBDesired);
        } else {
            uint256 amountBOptimal = quote(
                _amountADesired,
                reserveA,
                reserveB
            );
            if (amountBOptimal <= _amountBDesired) {
                require(amountBOptimal >= _amountBMin, "INSUFFICIENT_B_AMOUNT");
                (amountA, amountB) = (_amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = quote(
                    _amountBDesired,
                    reserveB,
                    reserveA
                );
                require(amountAOptimal <= _amountADesired, "UNAVAILABLE");
                require(amountAOptimal >= _amountAMin, "INSUFFICIENT_A_AMOUNT");
                (amountA, amountB) = (amountAOptimal, _amountBDesired);
            }
        }
    }

    /**
     * @notice Finish the erc20 transfer operation
     * @param _token ERC20 token address
     * @param _from Address to give out the token
     * @param _to Pair address to receive the token
     * @param _amount Transfer amount
     */
    function _transferHelper(
        address _token,
        address _from,
        address _to,
        uint256 _amount
    ) internal {
        IERC20(_token).safeTransferFrom(_from, _to, _amount);
    }

    /**
     * @notice Finish the ETH transfer operation
     * @param _to Address to receive the token
     * @param _amount Transfer amount
     */
    function _safeTransferETH(address _to, uint _amount) internal {
        (bool success,) = _to.call{value: _amount}("");
        require(success, "TransferHelper: ETH_TRANSFER_FAILED");
    }

    /**
     * @notice Finish swap process, requires the initial amount to have already been sent to the first pair
     * @param _amounts Amounts of token out for multiple swap
     * @param _path Address of tokens for multiple swap
     * @param _to Address of the final token receiver
     */
    function _swap(uint[] memory _amounts, address[] memory _path, address _to) private {
        for (uint i; i < _path.length - 1; i++) {
            // get token pair for each seperate swap
            (address input, address output) = (_path[i], _path[i + 1]);
            address token0 = input < output ? input : output;

            // get tokenOutAmount for each swap
            uint amountOut = _amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));

            address to = i < _path.length - 2 ? IFurionSwapFactory(factory).getPair(output, _path[i+2]) : _to;
            
            IFurionSwapPair(IFurionSwapFactory(factory).getPair(input, output)).swap(amount0Out, amount1Out, to);
        }
    }
}
