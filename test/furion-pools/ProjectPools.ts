import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { ProjectPool } from "../../src/types/contracts/project-pool/ProjectPool";
import type { ProjectPoolFactory } from "../../src/types/contracts/project-pool/ProjectPoolFactory";
import type { NFTest } from "../../src/types/contracts/test-only/NFTest";
import { Signers } from "../types";

describe("Project Pools", function () {
  // Signers declaration
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.bob = signers[1];
    this.signers.alice = signers[2];
  });

  describe("ProjectPoolFactory", function () {
    // Deploy clean ProjectPoolFactory and NFTest contract
    beforeEach(async function () {
      const nftArtifact: Artifact = await artifacts.readArtifact("NFTest");
      this.nft = <NFTest>(
        await waffle.deployContract(this.signers.admin, nftArtifact, [
          [this.signers.admin.address, this.signers.bob.address, this.signers.alice.address],
        ])
      );

      const ppfArtifact: Artifact = await artifacts.readArtifact("ProjectPoolFactory");
      this.ppf = <ProjectPoolFactory>await waffle.deployContract(this.signers.admin, ppfArtifact, []);
    });

    // Passed
    it("should deploy with correct admin and NFT allocated", async function () {
      expect(await this.ppf.owner()).to.equal(this.signers.admin.address);
      expect(await this.nft.balanceOf(this.signers.admin.address)).to.equal(1);
      expect(await this.nft.balanceOf(this.signers.bob.address)).to.equal(1);
      expect(await this.nft.balanceOf(this.signers.alice.address)).to.equal(1);
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

    it("should not create two pools with same NFT collection", async function () {
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
          [this.signers.admin.address, this.signers.bob.address, this.signers.alice.address],
        ])
      );

      const ppfArtifact: Artifact = await artifacts.readArtifact("ProjectPoolFactory");
      this.ppf = <ProjectPoolFactory>await waffle.deployContract(this.signers.admin, ppfArtifact, []);

      const poolAddress = await this.ppf.callStatic.createPool(this.nft.address);
      await this.ppf.createPool(this.nft.address);
      this.pool = <ProjectPool>await ethers.getContractAt("ProjectPool", poolAddress);
    });
  });
});
