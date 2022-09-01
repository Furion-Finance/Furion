import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { borrowTest } from "./FEther.borrow";
import { deployFEtherFixture } from "./FEther.fixture";
import { liquidateTest } from "./FEther.liquidate";
import { redeemTest } from "./FEther.redeem";
import { repayTest } from "./FEther.repay";
import { supplyTest } from "./FEther.supply";

describe("FEther", function () {
  before(async function () {
    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    const { spo, rm, nirm, feth, ffur } = await this.loadFixture(deployFEtherFixture);
    this.spo = spo;
    this.rm = rm;
    this.nirm = nirm;
    this.feth = feth;
    this.ffur = ffur;
  });

  supplyTest();

  redeemTest();

  borrowTest();

  repayTest();

  liquidateTest();
});
