import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";

import type { AggregatePool } from "../../../../src/types/contracts/aggregate-pool/AggregatePool";
import { Signers } from "../../../types";
import { deployAPFFixture } from "./AggregatePoolFactory.fixture";

describe("Aggregate Pool Factory", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.bob = signers[1];
    this.signers.alice = signers[2];

    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    const { nft, nft1, furT, checker, spf, apf, sp, sp1 } = await this.loadFixture(deployAPFFixture);
    this.nft = nft;
    this.nft1 = nft1;
    this.furT = furT;
    this.checker = checker;
    this.spf = spf;
    this.apf = apf;
    this.sp = sp;
    this.sp1 = sp1;
  });

  context("PoolCreation", async function () {
    it("should create aggregate pool with single token and register token", async function () {
      const AggregatePool = await this.apf.callStatic.createPool([this.sp.address]);
      // Check event emission
      await expect(this.apf.createPool([this.sp.address])).to.emit(this.apf, "PoolCreated");
      // Check state change on factory contract
      expect(await this.apf.getPool(1)).to.equal(AggregatePool);

      // Connect to deployed aggregate pool contract
      this.ap = <AggregatePool>await ethers.getContractAt("AggregatePool", AggregatePool);

      // Check registtration
      expect(await this.ap.registered(this.sp.address)).to.equal(true);
    });

    it("should create aggregate pools with multiple tokens and register token", async function () {
      const AggregatePool = await this.apf.callStatic.createPool([this.sp.address, this.sp1.address]);
      await this.apf.createPool([this.sp.address, this.sp1.address]);
      // Check state change on factory contract
      expect(await this.apf.getPool(1)).to.equal(AggregatePool);

      // Connect to deployed aggregate pool contract
      this.ap = <AggregatePool>await ethers.getContractAt("AggregatePool", AggregatePool);

      // Check registtration
      expect(await this.ap.registered(this.sp.address)).to.equal(true);
      expect(await this.ap.registered(this.sp1.address)).to.equal(true);
    });

    it("should create different pools", async function () {
      const AggregatePool = await this.apf.callStatic.createPool([this.sp.address]);
      await this.apf.createPool([this.sp.address]);
      const AggregatePool1 = await this.apf.callStatic.createPool([this.sp.address, this.sp1.address]);
      await this.apf.createPool([this.sp.address, this.sp1.address]);
      // Check state change on factory contract
      expect(await this.apf.getPool(1)).to.equal(AggregatePool);
      expect(await this.apf.getPool(2)).to.equal(AggregatePool1);

      // Connect to aggregate pools
      this.ap = <AggregatePool>await ethers.getContractAt("AggregatePool", AggregatePool);
      this.ap1 = <AggregatePool>await ethers.getContractAt("AggregatePool", AggregatePool1);

      // Check registration
      expect(await this.ap.registered(this.sp.address)).to.equal(true);
      expect(await this.ap1.registered(this.sp.address)).to.equal(true);
      expect(await this.ap1.registered(this.sp1.address)).to.equal(true);
    });

    /*
    it("should not create two same pools with same token list", async function () {
      await this.apf.createPool([this.sp.address]);
      await expect(this.apf.createPool([this.sp.address])).to.be.revertedWith(
        "AggregatePoolFactory: aggregate pool for these NFTs already exists.",
      );
    });
    */
  });
});
