import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { ethers } from "hardhat";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export function supplyRateTest(): void {
  describe("Supply Rate", function () {
    // Utilization rate = 0.5
    const cash: BigNumber = mantissa("10500");
    const borrow: BigNumber = mantissa("10000");
    const reserve: BigNumber = mantissa("500");

    it("should be correctly calculated", async function () {
      const contractBorrowRatePerBlock: BigNumber = await this.nirm.getBorrowRate(cash, borrow, reserve);
      // Reserve factor = 1- 2% = 98% = 0.98 = 98/100
      const calculatedSupplyRatePerBlock: BigNumber = contractBorrowRatePerBlock.mul(98).div(100).div(2);

      // Supply rate per block from contract, assume 2% reserve factor
      const contractSupplyRatePerBlock: BigNumber = await this.nirm.getSupplyRate(
        cash,
        borrow,
        reserve,
        mantissa("0.02"),
      );
      expect(contractSupplyRatePerBlock).to.equal(calculatedSupplyRatePerBlock);
    });
  });
}
