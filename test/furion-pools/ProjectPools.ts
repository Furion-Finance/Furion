import { BigNumberish } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { ProjectPool } from "../../src/types/contracts/project-pool/ProjectPool";
import type { ProjectPoolFactory } from "../../src/types/contracts/project-pool/ProjectPoolFactory";
import type { NFTest } from "../../src/types/contracts/test-only/NFTest";
import type { NFTest1 } from "../../src/types/contracts/test-only/NFTest1";
import { Signers } from "../types";

// Initial NFT balances: (id)
// admin: three NFT (0, 1, 2), one NFT1 (0)
// bob: one NFT (3), one NFT1 (1)
// alice: one NFT (4), one NFT1 (2)

describe("Project Pools", function () {
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

  xdescribe("ProjectPoolFactory", function () {
    // Deploy clean ProjectPoolFactory and NFTest contract
    beforeEach(async function () {
      const nftArtifact: Artifact = await artifacts.readArtifact("NFTest");
      this.nft = <NFTest>(
        await waffle.deployContract(this.signers.admin, nftArtifact, [
          [
            this.signers.admin.address,
            this.signers.admin.address,
            this.signers.admin.address,
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

      const ppfArtifact: Artifact = await artifacts.readArtifact("ProjectPoolFactory");
      this.ppf = <ProjectPoolFactory>await waffle.deployContract(this.signers.admin, ppfArtifact, []);
    });

    it("should deploy with correct admin", async function () {
      expect(await this.ppf.owner()).to.equal(this.signers.admin.address);
    });

    it("should create a project pool with correct token metadata", async function () {
      const poolAddress = await this.ppf.callStatic.createPool(this.nft.address);
      // Check event emission
      await expect(this.ppf.createPool(this.nft.address)).to.emit(this.ppf, "PoolCreated");
      // Check state change on factory contract
      expect(await this.ppf.getPool(this.nft.address)).to.equal(poolAddress);
      expect(await this.ppf.getNft(poolAddress)).to.equal(this.nft.address);

      // Connect to deployed token contract
      this.pool = <ProjectPool>await ethers.getContractAt("ProjectPool", poolAddress);

      // Check token metadata
      expect(await this.pool.name()).to.equal("Furion NFTest");
      expect(await this.pool.symbol()).to.equal("F-NFT");
    });

    it("should create different pools for different NFT colelctions", async function () {
      // First pool
      const poolAddress = await this.ppf.callStatic.createPool(this.nft.address);
      await this.ppf.createPool(this.nft.address);
      // Second pool
      const pool1Address = await this.ppf.callStatic.createPool(this.nft1.address);
      await this.ppf.createPool(this.nft1.address);

      this.pool = <ProjectPool>await ethers.getContractAt("ProjectPool", poolAddress);
      this.pool1 = <ProjectPool>await ethers.getContractAt("ProjectPool", pool1Address);

      expect(await this.pool.symbol()).to.equal("F-NFT");
      expect(await this.pool1.symbol()).to.equal("F-NFT1");
    });

    it("should not create two pools with the same NFT collection", async function () {
      await this.ppf.createPool(this.nft.address);
      await expect(this.ppf.createPool(this.nft.address)).to.be.revertedWith("ProjectPoolFactory: PAIR_EXISTS");
    });
  });

  describe("ProjectPool", function () {
    // Deploy clean ProjectPoolFactory, ProjectPool and NFTest contract
    beforeEach(async function () {
      const nftArtifact: Artifact = await artifacts.readArtifact("NFTest");
      this.nft = <NFTest>(
        await waffle.deployContract(this.signers.admin, nftArtifact, [
          [
            this.signers.admin.address,
            this.signers.admin.address,
            this.signers.admin.address,
            this.signers.bob.address,
            this.signers.alice.address,
          ],
        ])
      );

      const ppfArtifact: Artifact = await artifacts.readArtifact("ProjectPoolFactory");
      this.ppf = <ProjectPoolFactory>await waffle.deployContract(this.signers.admin, ppfArtifact, []);

      const poolAddress = await this.ppf.callStatic.createPool(this.nft.address);
      await this.ppf.createPool(this.nft.address);
      this.pool = <ProjectPool>await ethers.getContractAt("ProjectPool", poolAddress);
    });

    it("should sell NFT", async function () {
      // Approve NFT spending
      await this.nft.connect(this.signers.admin).approve(this.pool.address, 0);
      // Sell NFT event emission, total gas: 120624
      await expect(this.pool.connect(this.signers.admin)["sell(uint256)"](0)).to.emit(this.pool, "SoldNFT");
      // NFT transferred to pool contract
      expect(await this.nft.balanceOf(this.signers.admin.address)).to.equal(2);
      expect(await this.nft.balanceOf(this.pool.address)).to.equal(1);
      // F-* token balance increase
      expect(await this.pool.balanceOf(this.signers.admin.address)).to.equal(su("1000"));
    });

    it("should sell multiple NFTs in one tx", async function () {
      // Approve NFT spending
      await this.nft.connect(this.signers.admin).approve(this.pool.address, 0);
      await this.nft.connect(this.signers.admin).approve(this.pool.address, 1);
      await this.nft.connect(this.signers.admin).approve(this.pool.address, 2);
      // Batch selling, total gas: 156014
      await this.pool.connect(this.signers.admin)["sell(uint256[])"]([0, 1, 2]);
      // NFT transferred to pool contract
      expect(await this.nft.balanceOf(this.signers.admin.address)).to.equal(0);
      expect(await this.nft.balanceOf(this.pool.address)).to.equal(3);
      // F-* token balance increase
      expect(await this.pool.balanceOf(this.signers.admin.address)).to.equal(su("3000"));
    });
  });
});
