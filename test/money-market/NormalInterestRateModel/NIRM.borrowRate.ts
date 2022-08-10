import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { ethers } from "hardhat";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export function borrowRateTest(): void {
  describe("Borrow Rate", function () {
    // Utilization rate = 0.5
    const cash: BigNumber = mantissa("10500");
    const borrow: BigNumber = mantissa("10000");
    const reserve: BigNumber = mantissa("500");
    const multiplierPerYear: BigNumber = mantissa("0.2");
    const basePerYear: BigNumber = mantissa("0.03");

    it("should be correctly calculated", async function () {
      const blocksPerYear: BigNumber = await this.nirm.blocksPerYear();
      const multiplierPerBlock: BigNumber = multiplierPerYear.div(blocksPerYear);
      const basePerBlock: BigNumber = basePerYear.div(blocksPerYear);
      // Utilization rate = 1/2
      const calculatedBorrowRatePerBlock: BigNumber = multiplierPerBlock.div(2).add(basePerBlock);

      // Borrow rate per block from contract
      const contractBorrowRatePerBlock: BigNumber = await this.nirm.getBorrowRate(cash, borrow, reserve);
      expect(contractBorrowRatePerBlock).to.equal(calculatedBorrowRatePerBlock);
    });
  });
}
