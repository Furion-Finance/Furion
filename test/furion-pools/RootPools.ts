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

  xdescribe("RootPoolFactory", function () {
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

      // Deploy root pool factory
      const rpfArtifact: Artifact = await artifacts.readArtifact("RootPoolFactory");
      this.rpf = <RootPoolFactory>await waffle.deployContract(this.signers.admin, rpfArtifact, []);

      // Create project pools
      const projectPool = await this.ppf.callStatic.createPool(this.nft.address);
      await this.ppf.createPool(this.nft.address);
      const projectPool1 = await this.ppf.callStatic.createPool(this.nft1.address);
      await this.ppf.createPool(this.nft1.address);
      this.pp = <ProjectPool>await ethers.getContractAt("ProjectPool", projectPool);
      this.pp1 = <ProjectPool>await ethers.getContractAt("ProjectPool", projectPool1);
    });

    context("PoolCreation", async function () {
      it("should create root pool with single token and register token", async function () {
        const rootPool = await this.rpf.callStatic.createPool([this.pp.address]);
        // Check event emission
        await expect(this.rpf.createPool([this.pp.address])).to.emit(this.rpf, "PoolCreated");
        // Check state change on factory contract
        expect(await this.rpf.getPool(1)).to.equal(rootPool);

        // Connect to deployed root pool contract
        this.rp = <RootPool>await ethers.getContractAt("RootPool", rootPool);

        // Check registtration
        expect(await this.rp.registered(this.pp.address)).to.equal(true);
      });

      it("should create root pools with multiple tokens and register token", async function () {
        const rootPool = await this.rpf.callStatic.createPool([this.pp.address, this.pp1.address]);
        await this.rpf.createPool([this.pp.address, this.pp1.address]);
        // Check state change on factory contract
        expect(await this.rpf.getPool(1)).to.equal(rootPool);

        // Connect to deployed root pool contract
        this.rp = <RootPool>await ethers.getContractAt("RootPool", rootPool);

        // Check registtration
        expect(await this.rp.registered(this.pp.address)).to.equal(true);
        expect(await this.rp.registered(this.pp1.address)).to.equal(true);
      });

      it("should create different pools", async function () {
        const rootPool = await this.rpf.callStatic.createPool([this.pp.address]);
        await this.rpf.createPool([this.pp.address]);
        const rootPool1 = await this.rpf.callStatic.createPool([this.pp.address, this.pp1.address]);
        await this.rpf.createPool([this.pp.address, this.pp1.address]);
        // Check state change on factory contract
        expect(await this.rpf.getPool(1)).to.equal(rootPool);
        expect(await this.rpf.getPool(2)).to.equal(rootPool1);

        // Connect to root pools
        this.rp = <RootPool>await ethers.getContractAt("RootPool", rootPool);
        this.rp1 = <RootPool>await ethers.getContractAt("RootPool", rootPool1);

        // Check registration
        expect(await this.rp.registered(this.pp.address)).to.equal(true);
        expect(await this.rp1.registered(this.pp.address)).to.equal(true);
        expect(await this.rp1.registered(this.pp1.address)).to.equal(true);
      });

      /*
      it("should not create two same pools with same token list", async function () {
        await this.rpf.createPool([this.pp.address]);
        await expect(this.rpf.createPool([this.pp.address])).to.be.revertedWith(
          "RootPoolFactory: Root pool for these NFTs already exists.",
        );
      });
      */
    });
  });

  describe("RootPool", async function () {
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

      // Deploy root pool factory
      const rpfArtifact: Artifact = await artifacts.readArtifact("RootPoolFactory");
      this.rpf = <RootPoolFactory>await waffle.deployContract(this.signers.admin, rpfArtifact, []);

      // Create project pools
      const projectPool = await this.ppf.callStatic.createPool(this.nft.address);
      await this.ppf.createPool(this.nft.address);
      const pool1Address = await this.ppf.callStatic.createPool(this.nft1.address);
      await this.ppf.createPool(this.nft1.address);
      this.pp = <ProjectPool>await ethers.getContractAt("ProjectPool", projectPool);
      this.pp1 = <ProjectPool>await ethers.getContractAt("ProjectPool", pool1Address);

      // Bob sells NFT to project pools to get tokens (2000 F-NFT)
      await this.nft.connect(this.signers.bob).approve(this.pp.address, 3);
      await this.nft.connect(this.signers.bob).approve(this.pp.address, 4);
      await this.pp.connect(this.signers.bob)["sell(uint256[])"]([3, 4]);
      await this.nft1.connect(this.signers.bob).approve(this.pp1.address, 1);
      await this.pp1.connect(this.signers.bob)["sell(uint256)"](1);

      // Create root pool for F-NFT, token is FFT1
      const rootPool = await this.rpf.callStatic.createPool([this.pp.address]);
      await this.rpf.createPool([this.pp.address]);
      this.rp = <RootPool>await ethers.getContractAt("RootPool", rootPool);
    });

    context("Staking", async function () {
      it("should stake F-* tokens to get FFT with 0.01 ETH being the ref price of FFT for the first stake", async function () {
        // Bob stakes all F-NFT
        await this.pp.connect(this.signers.bob).approve(this.rp.address, su("2000"));
        await this.rp.connect(this.signers.bob).stake(this.pp.address, su("2000"), 0);
        // F-NFT in root pool
        expect(await this.pp.balanceOf(this.rp.address)).to.equal(su("2000"));
        // Bob gets ((15 / 1000) * 2000) / 0.01 * 0.99 (1% fee) = 2970 FFT1, based on the assumption that
        // the NFT now is worth 15 ETH and FFT has a ref price of 0.01 ETH for the first stake
        expect(await this.rp.balanceOf(this.signers.bob.address)).to.equal(su("2970"));
        // Admin is fee receiver
        expect(await this.rp.balanceOf(this.signers.admin.address)).to.equal(su("30"));
      });

      it("should stake F-* tokens to get FFT with ref price of FFT correctly calculated", async function () {
        // Bob stakes 1000 F-NFT first
        await this.pp.connect(this.signers.bob).approve(this.rp.address, su("2000"));
        await this.rp.connect(this.signers.bob).stake(this.pp.address, su("1000"), 0);
        // Bob gets ((15 / 1000) * 1000) / 0.01 * 0.99 (1% fee) = 1485 FFT1, based on the assumption that
        // the NFT now is worth 15 ETH and FFT has a ref price of 0.01 ETH for the first stake
        expect(await this.rp.balanceOf(this.signers.bob.address)).to.equal(su("1485"));
        // Bob stakes remaining 1000 F-NFT, when price of NFT increases to 18 ETH
        await this.rp.connect(this.signers.bob).stake(this.pp.address, su("1000"), 1);
        // FFT ref price = sum / circulating supply = ((18 / 1000) * 1000) / 1500 = 0.012 ETH
        // Bob gets ((18 / 1000) * 1000) / 0.012 * 0.99 (1% fee) = 1485 FFT1
        expect(await this.rp.balanceOf(this.signers.bob.address)).to.equal(su("2970"));
        expect(await this.rp.balanceOf(this.signers.admin.address)).to.equal(su("30"));
        expect(await this.pp.balanceOf(this.rp.address)).to.equal(su("2000"));
      });

      it("should not allow staking of non-registered tokens", async function () {
        // Bob tries to stake F-NFT1 which is not registered to the root pool
        await this.pp1.connect(this.signers.bob).approve(this.rp.address, su("1000"));
        await expect(this.rp.connect(this.signers.bob).stake(this.pp1.address, su("1000"), 0)).to.be.revertedWith(
          "RootPool: Token not accepted in this pool.",
        );
      });
    });
  });
});
