// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

interface IFurionSwapV2Router {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);

    function addLiquidity(
        address _tokenA,
        address _tokenB,
        uint _amountADesired,
        uint _amountBDesired,
        uint _amountAMin,
        uint _amountBMin,
        address _to,
        uint _deadline
    ) external returns (uint _amountA, uint _amountB, uint _liquidity);

    function addLiquidityETH(
        address _token,
        uint _amountTokenDesired,
        uint _amountTokenMin,
        uint _amountETHMin,
        address _to,
        uint _deadline
    ) external payable returns (uint _amountToken, uint _amountETH, uint _liquidity);

    function removeLiquidity(
        address _tokenA,
        address _tokenB,
        uint _liquidity,
        uint _amountAMin,
        uint _amountBMin,
        address _to,
        uint _deadline
    ) external returns (uint _amountA, uint _amountB);

    function removeLiquidityETH(
        address _token,
        uint _liquidity,
        uint _amountTokenMin,
        uint _amountETHMin,
        address _to,
        uint _deadline
    ) external returns (uint _amountToken, uint _amountETH);

    function swapExactTokensForTokens(
        uint _amountIn,
        uint _amountOutMin,
        address[] calldata _path,
        address _to,
        uint _deadline
    ) external returns (uint[] memory _amounts);

    function swapTokensForExactTokens(
        uint _amountOut,
        uint _amountInMax,
        address[] calldata _path,
        address _to,
        uint _deadline
    ) external returns (uint[] memory _amounts);

    function swapExactETHForTokens(
        uint _amountOutMin,
        address[] calldata _path,
        address _to,
        uint _deadline
    ) external payable returns (uint[] memory _amounts);

    function swapTokensForExactETH(
        uint _amountOut,
        uint _amountInMax,
        address[] calldata _path,
        address _to,
        uint _deadline
    ) external returns (uint[] memory _amounts);

    function swapExactTokensForETH(
        uint _amountIn,
        uint _amountOutMin,
        address[] calldata _path,
        address _to,
        uint _deadline
    ) external returns (uint[] memory amounts);

    function swapETHForExactTokens(
        uint _amountOut,
        address[] calldata _path,
        address _to,
        uint _deadline
    ) external payable returns (uint[] memory amounts);

    function getAmountOut(uint _amountIn, uint _reserveIn, uint _reserveOut) external pure returns (uint _amountOut);
    function getAmountIn(uint _amountOut, uint _reserveIn, uint _reserveOut) external pure returns (uint _amountIn);

    function getAmountsOut(uint _amountIn, address[] calldata _path) external view returns (uint[] memory _amounts);
    function getAmountsIn(uint _amountOut, address[] calldata _path) external view returns (uint[] memory _amounts);
}
