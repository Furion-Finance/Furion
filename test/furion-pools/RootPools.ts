import { BigNumberish } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { ProjectPool } from "../../src/types/contracts/project-pool/ProjectPool";
import type { ProjectPoolFactory } from "../../src/types/contracts/project-pool/ProjectPoolFactory";
import type { RootPool } from "../../src/types/contracts/root-pool/RootPool";
import type { RootPoolFactory } from "../../src/types/contracts/root-pool/RootPoolFactory";
import type { NFTest } from "../../src/types/contracts/test-only/NFTest";
import type { NFTest1 } from "../../src/types/contracts/test-only/NFTest1";
import type { FurionFungibleToken } from "../../src/types/contracts/tokens/FurionFungibleToken";
import { Signers } from "../types";

// Initial NFT balances: (id)
// admin: three NFT (0, 1, 2), one NFT1 (0)
// bob: two NFT (3, 4), one NFT1 (1)
// alice: one NFT (5), one NFT1 (2)

describe("Root Pools", function () {
  // Convert to smallest unit (10^18)
  function su(amount: string): BigNumberish {
    return ethers.utils.parseEther(amount);
  }

  // Signers declaration
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.bob = signers[1];
    this.signers.alice = signers[2];
  });

  describe("RootPoolFactory", function () {
    // Deploy clean ProjectPoolFactory and NFTest contract
    beforeEach(async function () {
      // Deploy NFTs
      const nftArtifact: Artifact = await artifacts.readArtifact("NFTest");
      this.nft = <NFTest>(
        await waffle.deployContract(this.signers.admin, nftArtifact, [
          [
            this.signers.admin.address,
            this.signers.admin.address,
            this.signers.admin.address,
            this.signers.bob.address,
            this.signers.bob.address,
            this.signers.alice.address,
          ],
        ])
      );

      const nft1Artifact: Artifact = await artifacts.readArtifact("NFTest1");
      this.nft1 = <NFTest1>(
        await waffle.deployContract(this.signers.admin, nft1Artifact, [
          [this.signers.admin.address, this.signers.bob.address, this.signers.alice.address],
        ])
      );

      // Deploy project pool factory
      const ppfArtifact: Artifact = await artifacts.readArtifact("ProjectPoolFactory");
      this.ppf = <ProjectPoolFactory>await waffle.deployContract(this.signers.admin, ppfArtifact, []);

      // Deploy FFT
      const fftArtifact: Artifact = await artifacts.readArtifact("FurionFungibleToken");
      this.fft = <FurionFungibleToken>await waffle.deployContract(this.signers.admin, fftArtifact, []);

      // Deploy root pool factory
      const rpfArtifact: Artifact = await artifacts.readArtifact("RootPoolFactory");
      this.rpf = <RootPoolFactory>await waffle.deployContract(this.signers.admin, rpfArtifact, [this.fft.address]);

      // Set root pool factory for FFT
      await this.fft.setRootPoolFactory(this.rpf.address);

      // Create project pools
      const poolAddress = await this.ppf.callStatic.createPool(this.nft.address);
      await this.ppf.createPool(this.nft.address);
      const pool1Address = await this.ppf.callStatic.createPool(this.nft1.address);
      await this.ppf.createPool(this.nft1.address);
      this.pp = <ProjectPool>await ethers.getContractAt("ProjectPool", poolAddress);
      this.pp1 = <ProjectPool>await ethers.getContractAt("ProjectPool", pool1Address);
    });

    context("PoolCreation", async function () {
      it("should create root pool with single token and register token", async function () {
        const poolAddress = await this.rpf.callStatic.createPool([this.pp.address]);
        // Check event emission
        await expect(this.rpf.createPool([this.pp.address])).to.emit(this.rpf, "PoolCreated");
        // Check state change on factory contract
        expect(await this.rpf.getPool(1)).to.equal(poolAddress);

        // Connect to deployed root pool contract
        this.rp = <RootPool>await ethers.getContractAt("RootPool", poolAddress);

        // Check registtration
        expect(await this.rp.registered(this.pp.address)).to.equal(true);
        expect(await this.fft.rootPools(this.rp.address)).to.equal(true);
      });

      it("should create root pools with multiple tokens and register token", async function () {
        const poolAddress = await this.rpf.callStatic.createPool([this.pp.address, this.pp1.address]);
        await this.rpf.createPool([this.pp.address, this.pp1.address]);
        // Check state change on factory contract
        expect(await this.rpf.getPool(1)).to.equal(poolAddress);

        // Connect to deployed root pool contract
        this.rp = <RootPool>await ethers.getContractAt("RootPool", poolAddress);

        // Check registtration
        expect(await this.rp.registered(this.pp.address)).to.equal(true);
        expect(await this.rp.registered(this.pp1.address)).to.equal(true);
        expect(await this.fft.rootPools(this.rp.address)).to.equal(true);
      });

      it("should create different pools", async function () {
        const poolAddress = await this.rpf.callStatic.createPool([this.pp.address]);
        await this.rpf.createPool([this.pp.address]);
        const pool1Address = await this.rpf.callStatic.createPool([this.pp.address, this.pp1.address]);
        await this.rpf.createPool([this.pp.address, this.pp1.address]);
        // Check state change on factory contract
        expect(await this.rpf.getPool(1)).to.equal(poolAddress);
        expect(await this.rpf.getPool(2)).to.equal(pool1Address);

        // Connect to root pools
        this.rp = <RootPool>await ethers.getContractAt("RootPool", poolAddress);
        this.rp1 = <RootPool>await ethers.getContractAt("RootPool", pool1Address);

        // Check registration
        expect(await this.rp.registered(this.pp.address)).to.equal(true);
        expect(await this.rp1.registered(this.pp.address)).to.equal(true);
        expect(await this.rp1.registered(this.pp1.address)).to.equal(true);
        expect(await this.fft.rootPools(this.rp.address)).to.equal(true);
        expect(await this.fft.rootPools(this.rp1.address)).to.equal(true);
      });

      it("should not create two same pools with same token list", async function () {
        await this.rpf.createPool([this.pp.address]);
        await expect(this.rpf.createPool([this.pp.address])).to.be.revertedWith(
          "RootPoolFactory: Root pool for these NFTs already exists.",
        );
      });
    });

    context("", async function () {});
  });
});
