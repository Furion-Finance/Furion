import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";

import type { SeparatePool } from "../../../../src/types/contracts/separate-pool/SeparatePool";
import { Signers } from "../../../types";
import { deploySPFFixture } from "./SeparatePoolFactory.fixture";

describe("Separate Pool Factory", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.bob = signers[1];
    this.signers.alice = signers[2];

    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    const { nft, nft1, spf } = await this.loadFixture(deploySPFFixture);
    this.nft = nft;
    this.nft1 = nft1;
    this.spf = spf;
  });

  context("Deployment", async function () {
    it("should deploy with correct admin", async function () {
      expect(await this.spf.owner()).to.equal(this.signers.admin.address);
    });
  });

  context("Pool Creation", async function () {
    it("should create a separate pool with correct token metadata", async function () {
      const poolAddress = await this.spf.callStatic.createPool(this.nft.address);
      // Check event emission
      await expect(this.spf.createPool(this.nft.address)).to.emit(this.spf, "PoolCreated");
      // Check state change on factory contract
      expect(await this.spf.getPool(this.nft.address)).to.equal(poolAddress);

      // Connect to deployed token contract
      this.sp = <SeparatePool>await ethers.getContractAt("SeparatePool", poolAddress);

      // Check token metadata
      expect(await this.sp.name()).to.equal("Furion NFTest");
      expect(await this.sp.symbol()).to.equal("F-NFT");
    });

    it("should create different pools for different NFT collections", async function () {
      // First pool
      const poolAddress = await this.spf.callStatic.createPool(this.nft.address);
      await this.spf.createPool(this.nft.address);
      // Second pool
      const pool1Address = await this.spf.callStatic.createPool(this.nft1.address);
      await this.spf.createPool(this.nft1.address);

      this.sp = <SeparatePool>await ethers.getContractAt("SeparatePool", poolAddress);
      this.sp1 = <SeparatePool>await ethers.getContractAt("SeparatePool", pool1Address);

      expect(await this.sp.symbol()).to.equal("F-NFT");
      expect(await this.sp1.symbol()).to.equal("F-NFT1");
    });

    it("should not create two pools with the same NFT collection", async function () {
      await this.spf.createPool(this.nft.address);
      await expect(this.spf.createPool(this.nft.address)).to.be.revertedWith("SeparatePoolFactory: PAIR_EXISTS");
    });
  });
});
