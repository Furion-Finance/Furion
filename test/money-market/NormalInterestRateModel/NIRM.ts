import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { borrowRateTest } from "./NIRM.borrowRate";
import { deployNirmFixture } from "./NIRM.fixture";
import { supplyRateTest } from "./NIRM.supplyRate";
import { utilizationRateTest } from "./NIRM.utilizationRate";

describe("NormalInterestRateModel", function () {
  // Signers declaration
  before(async function () {
    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    const { nirm } = await this.loadFixture(deployNirmFixture);
    this.nirm = nirm;
  });

  utilizationRateTest();

  borrowRateTest();

  supplyRateTest();
});
