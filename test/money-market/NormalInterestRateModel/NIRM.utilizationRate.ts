import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { ethers } from "hardhat";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export function utilizationRateTest(): void {
  describe("Utilization Rate", function () {
    const cash: BigNumber = mantissa("10500");
    const borrow0: number = 0;
    const borrow: BigNumber = mantissa("10000");
    const reserve: BigNumber = mantissa("500");

    it("should be correctly calculated", async function () {
      const result0: BigNumber = await this.nirm.utilizationRate(cash, borrow0, reserve);
      expect(result0).to.equal(0);

      const result: BigNumber = await this.nirm.utilizationRate(cash, borrow, reserve);
      expect(result).to.equal(mantissa("0.5"));
    });
  });
}
