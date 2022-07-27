// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IInterestRateModel.sol";

contract JumpInterestRateModel is Ownable, IInterestRateModel {
    bool public constant IS_INTEREST_RATE_MODEL = true;

    uint256 private constant BASE = 1e18;

    /**
     * @notice The approximate number of blocks per year that is assumed by the interest rate model
     */
    uint256 public constant blocksPerYear = 2102400;

    /**
     * @notice The multiplier of utilization rate that gives the slope of the interest rate
     */
    uint256 public multiplierPerBlock;

    /**
     * @notice The base interest rate which is the y-intercept when utilization rate is 0
     */
    uint256 public baseRatePerBlock;

    /**
     * @notice The multiplierPerBlock after hitting a specified utilization point
     */
    uint256 public jumpMultiplierPerBlock;

    /**
     * @notice The utilization point at which the jump multiplier is applied
     */
    uint256 public kink;

    event NewInterestParams(
        uint256 baseRatePerBlock,
        uint256 multiplierPerBlock,
        uint256 jumpMultiplierPerBlock,
        uint256 kink
    );

    /**
     * @notice Construct an interest rate model
     * @param _baseRatePerYear The approximate target base APR, as a mantissa (scaled by BASE)
     * @param _multiplierPerYear The rate of increase in interest rate wrt utilization (scaled by BASE)
     * @param _jumpMultiplierPerYear The multiplierPerBlock after hitting a specified utilization point
     * @param _kink The utilization point at which the jump multiplier is applied
     */
    constructor(
        uint256 _baseRatePerYear,
        uint256 _multiplierPerYear,
        uint256 _jumpMultiplierPerYear,
        uint256 _kink
    ) {
        baseRatePerBlock = _baseRatePerYear / blocksPerYear;
        multiplierPerBlock =
            (_multiplierPerYear * BASE) /
            (blocksPerYear * _kink);
        jumpMultiplierPerBlock = _jumpMultiplierPerYear / blocksPerYear;
        kink = _kink;

        emit NewInterestParams(
            baseRatePerBlock,
            multiplierPerBlock,
            jumpMultiplierPerBlock,
            kink
        );
    }

    function isInterestRateModel() public pure returns (bool) {
        return IS_INTEREST_RATE_MODEL;
    }

    /**
     * @notice Internal function to update the parameters of the interest rate model
     * @param _baseRatePerYear The approximate target base APR, as a mantissa (scaled by BASE)
     * @param _multiplierPerYear The rate of increase in interest rate wrt utilization (scaled by BASE)
     * @param _jumpMultiplierPerYear The multiplierPerBlock after hitting a specified utilization point
     * @param _kink The utilization point at which the jump multiplier is applied
     */
    function updateJumpRateModel(
        uint256 _baseRatePerYear,
        uint256 _multiplierPerYear,
        uint256 _jumpMultiplierPerYear,
        uint256 _kink
    ) external onlyOwner {
        baseRatePerBlock = _baseRatePerYear / blocksPerYear;
        multiplierPerBlock =
            (_multiplierPerYear * BASE) /
            (blocksPerYear * _kink);
        jumpMultiplierPerBlock = _jumpMultiplierPerYear / blocksPerYear;
        kink = _kink;

        emit NewInterestParams(
            baseRatePerBlock,
            multiplierPerBlock,
            jumpMultiplierPerBlock,
            kink
        );
    }

    /**
     * @notice Calculates the utilization rate of the market: `borrows / (cash + borrows - reserves)`
     * @param _cash The amount of cash in the market
     * @param _borrows The amount of borrows in the market
     * @param _reserves The amount of reserves in the market (currently unused)
     * @return The utilization rate as a mantissa between [0, BASE]
     */
    function utilizationRate(
        uint256 _cash,
        uint256 _borrows,
        uint256 _reserves
    ) public pure returns (uint256) {
        // Utilization rate is 0 when there are no borrows
        if (_borrows == 0) {
            return 0;
        }

        return (_borrows * BASE) / (_cash + _borrows - _reserves);
    }

    /**
     * @notice Calculates the current borrow rate per block, with the error code expected by the market
     * @param _cash The amount of cash in the market
     * @param _borrows The amount of borrows in the market
     * @param _reserves The amount of reserves in the market
     * @return The borrow rate percentage per block as a mantissa (scaled by BASE)
     */
    function getBorrowRate(
        uint256 _cash,
        uint256 _borrows,
        uint256 _reserves
    ) public view returns (uint256) {
        uint256 util = utilizationRate(_cash, _borrows, _reserves);

        if (util <= kink) {
            return ((util * multiplierPerBlock) / BASE) + baseRatePerBlock;
        } else {
            uint256 normalRate = ((kink * multiplierPerBlock) / BASE) +
                baseRatePerBlock;
            uint256 excessUtil = util - kink;
            return ((excessUtil * jumpMultiplierPerBlock) / BASE) + normalRate;
        }
    }

    /**
     * @notice Calculates the current supply rate per block
     * @param _cash The amount of cash in the market
     * @param _borrows The amount of borrows in the market
     * @param _reserves The amount of reserves in the market
     * @param _reserveFactorMantissa The current reserve factor for the market
     * @return The supply rate percentage per block as a mantissa (scaled by BASE)
     */
    function getSupplyRate(
        uint256 _cash,
        uint256 _borrows,
        uint256 _reserves,
        uint256 _reserveFactorMantissa
    ) public view returns (uint256) {
        uint256 oneMinusReserveFactor = BASE - _reserveFactorMantissa;
        uint256 borrowRate = getBorrowRate(_cash, _borrows, _reserves);
        uint256 rateToPool = (borrowRate * oneMinusReserveFactor) / BASE;
        return
            (utilizationRate(_cash, _borrows, _reserves) * rateToPool) / BASE;
    }
}
