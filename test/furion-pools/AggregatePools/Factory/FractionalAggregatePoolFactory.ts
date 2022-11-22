import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";

import type { FractionalAggregatePool } from "../../../../typechain";
import { Signers } from "../../../types";
import { deployFAPFFixture } from "./FractionalAggregatePoolFactory.fixture";

describe("Fractional Aggregate Pool Factory", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.bob = signers[1];
    this.signers.alice = signers[2];

    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    const { fapf, sp, sp1 } = await this.loadFixture(deployFAPFFixture);
    this.fapf = fapf;
    this.sp = sp;
    this.sp1 = sp1;
  });

  context("PoolCreation", async function () {
    it("should create aggregate pool with single token and register token", async function () {
      const fapAddress = await this.fapf.callStatic.createPool([this.sp.address], "Single", "SING");
      // Check event emission
      await expect(this.fapf.createPool([this.sp.address], "Single", "SING")).to.emit(this.fapf, "PoolCreated");
      // Check state change on factory contract
      expect(await this.fapf.getPool(0)).to.equal(fapAddress);

      // Connect to deployed aggregate pool contract
      this.fap = <FractionalAggregatePool>await ethers.getContractAt("FractionalAggregatePool", fapAddress);

      // Check registtration
      expect(await this.fap.registered(this.sp.address)).to.equal(true);
    });

    it("should create aggregate pools with multiple tokens and register token", async function () {
      const fapAddress = await this.fapf.callStatic.createPool([this.sp.address, this.sp1.address], "Multiple", "MUL");
      await this.fapf.createPool([this.sp.address, this.sp1.address], "Multiple", "MUL");
      // Check state change on factory contract
      expect(await this.fapf.getPool(0)).to.equal(fapAddress);

      // Connect to deployed aggregate pool contract
      this.fap = <FractionalAggregatePool>await ethers.getContractAt("FractionalAggregatePool", fapAddress);

      // Check registtration
      expect(await this.fap.registered(this.sp.address)).to.equal(true);
      expect(await this.fap.registered(this.sp1.address)).to.equal(true);
    });

    it("should create different pools", async function () {
      const fapAddress = await this.fapf.callStatic.createPool([this.sp.address], "Single", "SING");
      await this.fapf.createPool([this.sp.address], "Single", "SING");
      const fapAddress1 = await this.fapf.callStatic.createPool([this.sp.address, this.sp1.address], "Multiple", "MUL");
      await this.fapf.createPool([this.sp.address, this.sp1.address], "Multiple", "MUL");
      // Check state change on factory contract
      expect(await this.fapf.getPool(0)).to.equal(fapAddress);
      expect(await this.fapf.getPool(1)).to.equal(fapAddress1);

      // Connect to aggregate pools
      this.fap = <FractionalAggregatePool>await ethers.getContractAt("FractionalAggregatePool", fapAddress);
      this.fap1 = <FractionalAggregatePool>await ethers.getContractAt("FractionalAggregatePool", fapAddress1);

      // Check registration
      expect(await this.fap.registered(this.sp.address)).to.equal(true);
      expect(await this.fap1.registered(this.sp.address)).to.equal(true);
      expect(await this.fap1.registered(this.sp1.address)).to.equal(true);
    });

    /*
    it("should not create two same pools with same token list", async function () {
      await this.fapf.createPool([this.sp.address]);
      await expect(this.fapf.createPool([this.sp.address])).to.be.revertedWith(
        "AggregatePoolFactory: aggregate pool for these NFTs already exists.",
      );
    });
    */
  });
});
