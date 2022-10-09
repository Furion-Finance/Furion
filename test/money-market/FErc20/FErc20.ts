import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { borrowTest } from "./FErc20.borrow";
import { deployFErcFixture } from "./FErc20.fixture";
import { liquidateTest } from "./FErc20.liquidate";
import { redeemTest } from "./FErc20.redeem";
import { repayTest } from "./FErc20.repay";
import { supplyTest } from "./FErc20.supply";

describe("FErc20", function () {
  before(async function () {
    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    const { checker, sp, spo, rm, nirm, feth, ferc } = await this.loadFixture(deployFErcFixture);
    this.checker = checker;
    this.sp = sp;
    this.spo = spo;
    this.rm = rm;
    this.nirm = nirm;
    this.feth = feth;
    this.ferc = ferc;
  });

  supplyTest();

  redeemTest();

  borrowTest();

  repayTest();

  liquidateTest();
});
