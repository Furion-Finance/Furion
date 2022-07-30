import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { NormalInterestRateModel } from "../../src/types/contracts/money-market/NormalInterestRateModel";
import { Signers } from "../types";

xdescribe("NormalInterestRateModel", function () {
  function mantissa(amount: string): BigNumber {
    return ethers.utils.parseUnits(amount, 18);
  }

  // Signers declaration
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.bob = signers[1];
    this.signers.alice = signers[2];
  });

  beforeEach(async function () {
    // Deploy interest rate model
    const nirmArtifact: Artifact = await artifacts.readArtifact("NormalInterestRateModel");
    this.nirm = <NormalInterestRateModel>(
      await waffle.deployContract(this.signers.admin, nirmArtifact, [mantissa("0.03"), mantissa("0.2")])
    );
  });

  it("should correctly calculate utilization rate", async function () {
    const cash: BigNumber = mantissa("10500");
    const borrow0: number = 0;
    const borrow: BigNumber = mantissa("10000");
    const reserve: BigNumber = mantissa("500");

    const result0: BigNumber = await this.nirm.utilizationRate(cash, borrow0, reserve);
    expect(result0).to.equal(0);

    const result: BigNumber = await this.nirm.utilizationRate(cash, borrow, reserve);
    expect(result).to.equal(mantissa("0.5"));
  });

  it("should correctly calculate borrow rate", async function () {
    // Utilization rate = 0.5
    const cash: BigNumber = mantissa("10500");
    const borrow: BigNumber = mantissa("10000");
    const reserve: BigNumber = mantissa("500");

    const blocksPerYear: BigNumber = await this.nirm.blocksPerYear();
    const multiplierPerBlock: BigNumber = mantissa("0.2").div(blocksPerYear);
    const basePerBlock: BigNumber = mantissa("0.03").div(blocksPerYear);
    // Utilization rate = 1/2
    const calculatedBorrowRatePerBlock: BigNumber = multiplierPerBlock.div(2).add(basePerBlock);

    // Borrow rate per block from contract
    const contractBorrowRatePerBlock: BigNumber = await this.nirm.getBorrowRate(cash, borrow, reserve);
    expect(contractBorrowRatePerBlock).to.equal(calculatedBorrowRatePerBlock);
  });

  it("should correctly calculate supply rate", async function () {
    // Utilization rate = 0.5
    const cash: BigNumber = mantissa("10500");
    const borrow: BigNumber = mantissa("10000");
    const reserve: BigNumber = mantissa("500");

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
