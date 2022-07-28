import { BigNumberish } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { Checker } from "../../src/types/contracts/Checker";
import type { AggregatePool } from "../../src/types/contracts/aggregate-pool/AggregatePool";
import type { AggregatePoolFactory } from "../../src/types/contracts/aggregate-pool/AggregatePoolFactory";
import type { SeparatePool } from "../../src/types/contracts/separate-pool/SeparatePool";
import type { SeparatePoolFactory } from "../../src/types/contracts/separate-pool/SeparatePoolFactory";
import type { FurionTokenTest } from "../../src/types/contracts/test-only/FurionTokenTest";
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

  describe("AggregatePoolFactory", function () {
    // Deploy clean SeparatePoolFactory and NFTest contract
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

      // Deploy FUR
      const furTArtifact: Artifact = await artifacts.readArtifact("FurionTokenTest");
      this.furT = <FurionTokenTest>(
        await waffle.deployContract(this.signers.admin, furTArtifact, [
          [this.signers.admin.address, this.signers.bob.address, this.signers.alice.address],
        ])
      );

      // Deploy checker
      const checkerArtifact: Artifact = await artifacts.readArtifact("Checker");
      this.checker = <Checker>await waffle.deployContract(this.signers.admin, checkerArtifact, []);

      // Deploy project pool factory
      const spfArtifact: Artifact = await artifacts.readArtifact("SeparatePoolFactory");
      this.spf = <SeparatePoolFactory>(
        await waffle.deployContract(this.signers.admin, spfArtifact, [this.checker.address, this.furT.address])
      );

      // Deploy root pool factory
      const apfArtifact: Artifact = await artifacts.readArtifact("AggregatePoolFactory");
      this.apf = <AggregatePoolFactory>(
        await waffle.deployContract(this.signers.admin, apfArtifact, [this.checker.address, this.furT.address])
      );

      // Set factories
      await this.checker.connect(this.signers.admin).setPPFactory(this.spf.address);
      await this.checker.connect(this.signers.admin).setRPFactory(this.apf.address);

      // Create project pools
      const SeparatePool = await this.spf.callStatic.createPool(this.nft.address);
      await this.spf.createPool(this.nft.address);
      const SeparatePool1 = await this.spf.callStatic.createPool(this.nft1.address);
      await this.spf.createPool(this.nft1.address);
      this.sp = <SeparatePool>await ethers.getContractAt("SeparatePool", SeparatePool);
      this.sp1 = <SeparatePool>await ethers.getContractAt("SeparatePool", SeparatePool1);
    });

    context("PoolCreation", async function () {
      it("should create root pool with single token and register token", async function () {
        const AggregatePool = await this.apf.callStatic.createPool([this.sp.address]);
        // Check event emission
        await expect(this.apf.createPool([this.sp.address])).to.emit(this.apf, "PoolCreated");
        // Check state change on factory contract
        expect(await this.apf.getPool(1)).to.equal(AggregatePool);

        // Connect to deployed root pool contract
        this.ap = <AggregatePool>await ethers.getContractAt("AggregatePool", AggregatePool);

        // Check registtration
        expect(await this.ap.registered(this.sp.address)).to.equal(true);
      });

      it("should create root pools with multiple tokens and register token", async function () {
        const AggregatePool = await this.apf.callStatic.createPool([this.sp.address, this.sp1.address]);
        await this.apf.createPool([this.sp.address, this.sp1.address]);
        // Check state change on factory contract
        expect(await this.apf.getPool(1)).to.equal(AggregatePool);

        // Connect to deployed root pool contract
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

        // Connect to root pools
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
          "AggregatePoolFactory: Root pool for these NFTs already exists.",
        );
      });
      */
    });
  });

  describe("AggregatePool", async function () {
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

      // Deploy FUR
      const furTArtifact: Artifact = await artifacts.readArtifact("FurionTokenTest");
      this.furT = <FurionTokenTest>(
        await waffle.deployContract(this.signers.admin, furTArtifact, [
          [this.signers.admin.address, this.signers.bob.address, this.signers.alice.address],
        ])
      );

      // Deploy checker
      const checkerArtifact: Artifact = await artifacts.readArtifact("Checker");
      this.checker = <Checker>await waffle.deployContract(this.signers.admin, checkerArtifact, []);

      // Deploy project pool factory
      const spfArtifact: Artifact = await artifacts.readArtifact("SeparatePoolFactory");
      this.spf = <SeparatePoolFactory>(
        await waffle.deployContract(this.signers.admin, spfArtifact, [this.checker.address, this.furT.address])
      );

      // Deploy root pool factory
      const apfArtifact: Artifact = await artifacts.readArtifact("AggregatePoolFactory");
      this.apf = <AggregatePoolFactory>(
        await waffle.deployContract(this.signers.admin, apfArtifact, [this.checker.address, this.furT.address])
      );

      // Set factories
      await this.checker.connect(this.signers.admin).setPPFactory(this.spf.address);
      await this.checker.connect(this.signers.admin).setRPFactory(this.apf.address);

      // Create project pools
      const SeparatePool = await this.spf.callStatic.createPool(this.nft.address);
      await this.spf.createPool(this.nft.address);
      const pool1Address = await this.spf.callStatic.createPool(this.nft1.address);
      await this.spf.createPool(this.nft1.address);
      this.sp = <SeparatePool>await ethers.getContractAt("SeparatePool", SeparatePool);
      this.sp1 = <SeparatePool>await ethers.getContractAt("SeparatePool", pool1Address);

      // Bob sells NFT to project pools to get tokens (2000 F-NFT)
      await this.nft.connect(this.signers.bob).approve(this.sp.address, 3);
      await this.nft.connect(this.signers.bob).approve(this.sp.address, 4);
      await this.sp.connect(this.signers.bob)["sell(uint256[])"]([3, 4]);
      await this.nft1.connect(this.signers.bob).approve(this.sp1.address, 1);
      await this.sp1.connect(this.signers.bob)["sell(uint256)"](1);

      // Create root pool for F-NFT, token is FFT1
      const AggregatePool = await this.apf.callStatic.createPool([this.sp.address]);
      await this.apf.createPool([this.sp.address]);
      this.ap = <AggregatePool>await ethers.getContractAt("AggregatePool", AggregatePool);
    });

    context("Staking", async function () {
      it("should stake F-* tokens to get FFT with 0.01 ETH being the ref price of FFT for the first stake", async function () {
        // Bob stakes all F-NFT
        await this.sp.connect(this.signers.bob).approve(this.ap.address, su("2000"));
        await this.furT.connect(this.signers.bob).approve(this.ap.address, su("100"));
        await this.ap.connect(this.signers.bob).stake(this.sp.address, su("2000"), 0);

        // F-NFT in root pool
        expect(await this.sp.balanceOf(this.ap.address)).to.equal(su("2000"));
        // Bob gets ((15 / 1000) * 2000) / 0.01 = 3000 FFT1, based on the assumption that
        // the NFT now is worth 15 ETH and FFT has a ref price of 0.01 ETH for the first stake
        expect(await this.ap.balanceOf(this.signers.bob.address)).to.equal(su("3000"));
        // Admin is fee receiver, 100 = 100 FUR
        expect(await this.furT.balanceOf(this.signers.admin.address)).to.equal(su("1100"));
        expect(await this.furT.balanceOf(this.signers.bob.address)).to.equal(su("900"));
      });

      it("should stake F-* tokens to get FFT with ref price of FFT correctly calculated", async function () {
        // Bob stakes 1000 F-NFT first
        await this.sp.connect(this.signers.bob).approve(this.ap.address, su("2000"));
        await this.furT.connect(this.signers.bob).approve(this.ap.address, su("200"));
        await this.ap.connect(this.signers.bob).stake(this.sp.address, su("1000"), 0);

        // Bob gets ((15 / 1000) * 1000) / 0.01 = 1500 FFT1, based on the assumption that
        // the NFT now is worth 15 ETH and FFT has a ref price of 0.01 ETH for the first stake
        expect(await this.ap.balanceOf(this.signers.bob.address)).to.equal(su("1500"));

        // Bob stakes remaining 1000 F-NFT, when price of NFT increases to 18 ETH
        await this.ap.connect(this.signers.bob).stake(this.sp.address, su("1000"), 1);

        // FFT ref price = sum / circulating supply = ((18 / 1000) * 1000) / 1500 = 0.012 ETH
        // Bob gets ((18 / 1000) * 1000) / 0.012 = 1500 FFT1
        expect(await this.ap.balanceOf(this.signers.bob.address)).to.equal(su("3000"));
        // Admin is fee receiver, 100 + 100 = 200 FUR
        expect(await this.furT.balanceOf(this.signers.admin.address)).to.equal(su("1200"));
        expect(await this.furT.balanceOf(this.signers.bob.address)).to.equal(su("800"));
        expect(await this.sp.balanceOf(this.ap.address)).to.equal(su("2000"));
      });

      it("should not allow staking of unregistered tokens", async function () {
        // Bob tries to stake F-NFT1 which is not registered to the root pool
        await this.sp1.connect(this.signers.bob).approve(this.ap.address, su("1000"));
        await this.furT.connect(this.signers.bob).approve(this.ap.address, su("100"));
        await expect(this.ap.connect(this.signers.bob).stake(this.sp1.address, su("1000"), 0)).to.be.revertedWith(
          "AggregatePool: Token not accepted in this pool.",
        );
      });
    });

    context("Unstaking", async function () {
      it("should unstake with correct calculations given no NFT price changes", async function () {
        // Bob stakes all F-NFT, gets 3000 FFT1
        await this.sp.connect(this.signers.bob).approve(this.ap.address, su("2000"));
        await this.furT.connect(this.signers.bob).approve(this.ap.address, su("100"));
        await this.ap.connect(this.signers.bob).stake(this.sp.address, su("2000"), 0);

        // Bob unstakes with 3000 FFT1
        await this.furT.connect(this.signers.bob).approve(this.ap.address, su("100"));
        await this.ap.connect(this.signers.bob).unstake(this.sp.address, su("3000"), 0);
        // Bob gets 3000 * (30 / 3000) / 0.015 = 2000 F-NFT
        expect(await this.sp.balanceOf(this.signers.bob.address)).to.equal(su("2000"));
        // Admin (fee receiver) gets 100 + 100 = 200 FUR
        expect(await this.furT.balanceOf(this.signers.admin.address)).to.equal(su("1200"));
        expect(await this.furT.balanceOf(this.signers.bob.address)).to.equal(su("800"));
      });

      it("should unstake with correct calculations given NFT price changes", async function () {
        // Bob stakes all F-NFT, gets 3000 FFT1
        await this.sp.connect(this.signers.bob).approve(this.ap.address, su("2000"));
        await this.furT.connect(this.signers.bob).approve(this.ap.address, su("100"));
        await this.ap.connect(this.signers.bob).stake(this.sp.address, su("2000"), 0);

        // Bob unstakes with 3000 FFT1
        await this.furT.connect(this.signers.bob).approve(this.ap.address, su("100"));
        await this.ap.connect(this.signers.bob).unstake(this.sp.address, su("3000"), 1);
        // Price of NFT increases to 18 ETH
        // Bob gets 3000 * (36 / 3000) / 0.018 = 2000 F-NFT
        expect(await this.sp.balanceOf(this.signers.bob.address)).to.equal(su("2000"));
        // Admin (fee receiver) gets 100 + 100 = 200 FUR
        expect(await this.furT.balanceOf(this.signers.admin.address)).to.equal(su("1200"));
        expect(await this.furT.balanceOf(this.signers.bob.address)).to.equal(su("800"));
      });

      it("should not allow unstaking of unregistered tokens", async function () {
        // Bob stakes all F-NFT, gets 3000 FFT1
        await this.sp.connect(this.signers.bob).approve(this.ap.address, su("2000"));
        await this.furT.connect(this.signers.bob).approve(this.ap.address, su("100"));
        await this.ap.connect(this.signers.bob).stake(this.sp.address, su("2000"), 0);

        // Bob tries to unstake with 3000 FFT1 to get F-NFT1 which is unregistered
        await expect(this.ap.connect(this.signers.bob).unstake(this.sp1.address, su("3000"), 0)).to.be.revertedWith(
          "AggregatePool: Token not accepted in this pool.",
        );
      });
    });
  });
});
