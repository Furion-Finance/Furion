import { BigNumberish } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { Checker } from "../../src/types/contracts/Checker";
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

// Initial FUR balance:
// admin: 1000
// bob: 1000
// alice: 1000

describe("Separate Pools", function () {
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

  describe("SeparatePoolFactory", function () {
    // Deploy clean SeparatePoolFactory and NFTest contract
    beforeEach(async function () {
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
      expect(await this.furT.balanceOf(this.signers.admin.address)).to.equal(su("1000"));
      expect(await this.furT.balanceOf(this.signers.bob.address)).to.equal(su("1000"));
      expect(await this.furT.balanceOf(this.signers.alice.address)).to.equal(su("1000"));

      // Deploy checker
      const checkerArtifact: Artifact = await artifacts.readArtifact("Checker");
      this.checker = <Checker>await waffle.deployContract(this.signers.admin, checkerArtifact, []);

      const spfArtifact: Artifact = await artifacts.readArtifact("SeparatePoolFactory");
      this.spf = <SeparatePoolFactory>(
        await waffle.deployContract(this.signers.admin, spfArtifact, [this.checker.address, this.furT.address])
      );

      // Set factory
      await this.checker.connect(this.signers.admin).setSPFactory(this.spf.address);
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

  describe("SeparatePool", function () {
    // Deploy clean SeparatePoolFactory, SeparatePool and NFTest contract
    beforeEach(async function () {
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
            this.signers.admin.address,
            this.signers.admin.address,
            this.signers.admin.address,
            this.signers.admin.address,
            this.signers.admin.address,
            this.signers.admin.address,
            this.signers.admin.address,
          ],
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

      const spfArtifact: Artifact = await artifacts.readArtifact("SeparatePoolFactory");
      this.spf = <SeparatePoolFactory>(
        await waffle.deployContract(this.signers.admin, spfArtifact, [this.checker.address, this.furT.address])
      );

      // Set factory
      await this.checker.connect(this.signers.admin).setSPFactory(this.spf.address);

      const poolAddress = await this.spf.callStatic.createPool(this.nft.address);
      await this.spf.createPool(this.nft.address);
      this.sp = <SeparatePool>await ethers.getContractAt("SeparatePool", poolAddress);
    });

    context("Selling", async function () {
      it("should sell NFT", async function () {
        // Approve NFT spending
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 0);
        // Sell NFT event emission, total gas: 120624
        await expect(this.sp.connect(this.signers.admin)["sell(uint256)"](0)).to.emit(this.sp, "SoldNFT");
        // NFT transferred to pool contract
        expect(await this.nft.ownerOf(0)).to.equal(this.sp.address);
        // F-* token balance increase
        expect(await this.sp.balanceOf(this.signers.admin.address)).to.equal(su("1000"));
      });

      it("should sell multiple NFTs in one tx", async function () {
        // Approve NFT spending
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 0);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 1);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 2);
        // Batch selling, total gas: 156014
        await this.sp.connect(this.signers.admin)["sell(uint256[])"]([0, 1, 2]);
        // NFT transferred to pool contract
        expect(await this.nft.balanceOf(this.sp.address)).to.equal(3);
        // F-* token balance increase
        expect(await this.sp.balanceOf(this.signers.admin.address)).to.equal(su("3000"));
      });

      it("should not allow selling of more than 9 NFTs in one tx", async function () {
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 0);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 1);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 2);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 6);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 7);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 8);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 9);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 10);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 11);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 12);

        // Admin tries to sell 10 NFTs in one tx
        await expect(
          this.sp.connect(this.signers.admin)["sell(uint256[])"]([0, 1, 2, 6, 7, 8, 9, 10, 11, 12]),
        ).to.be.revertedWith("SeparatePool: Can only sell 9 NFTs at once");
      });
    });

    context("Buying", async function () {
      it("should buy NFT", async function () {
        // Admin sells two NFTs, gets 2000 pool tokens
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 0);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 1);
        await this.sp.connect(this.signers.admin)["sell(uint256[])"]([0, 1]);
        // Admin transfers 2000 tokens to Bob
        await this.sp.connect(this.signers.admin).transfer(this.signers.bob.address, su("2000"));
        // Bob buys one NFT with 1000 tokens, check event emission
        await this.furT.connect(this.signers.bob).approve(this.sp.address, su("100"));
        await expect(this.sp.connect(this.signers.bob)["buy(uint256)"](0)).to.emit(this.sp, "BoughtNFT");
        expect(await this.nft.ownerOf(0)).to.equal(this.signers.bob.address);
        // F-NFT: 2000 - 1000 = 1000
        expect(await this.sp.balanceOf(this.signers.bob.address)).to.equal(su("1000"));
        // FUR: 1000 - 100 = 900
        expect(await this.furT.balanceOf(this.signers.bob.address)).to.equal(su("900"));
        // Admin is fee reveiver, 1000 + 100 = 1100 FUR
        expect(await this.furT.balanceOf(this.signers.admin.address)).to.equal(su("1100"));
      });

      it("should buy multiple NFTs in one tx", async function () {
        // Admin sells three NFTs, gets 3000 pool tokens
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 0);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 1);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 2);
        await this.sp.connect(this.signers.admin)["sell(uint256[])"]([0, 1, 2]);
        // Admin transfers 3000 tokens to Bob
        await this.sp.connect(this.signers.admin).transfer(this.signers.bob.address, su("3000"));
        // Bob buys the two NFTs with 2000 tokens
        await this.furT.connect(this.signers.bob).approve(this.sp.address, su("200"));
        await this.sp.connect(this.signers.bob)["buy(uint256[])"]([0, 1]);
        expect(await this.nft.ownerOf(0)).to.equal(this.signers.bob.address);
        expect(await this.nft.ownerOf(1)).to.equal(this.signers.bob.address);
        // F-NFT: 3000 - 2000 = 1000
        expect(await this.sp.balanceOf(this.signers.bob.address)).to.equal(su("1000"));
        // FUR: 1000 - 100 * 2 = 800
        expect(await this.furT.balanceOf(this.signers.bob.address)).to.equal(su("800"));
        // Admin is fee reveiver, 1000 + 200 = 1200 FUR
        expect(await this.furT.balanceOf(this.signers.admin.address)).to.equal(su("1200"));
      });

      it("should not allow buying of more than 9 NFTs in one tx", async function () {
        // Admin sells 10 NFTs separately, gets 10000 F-NFT
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 0);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 1);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 2);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 6);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 7);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 8);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 9);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 10);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 11);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 12);

        await this.sp.connect(this.signers.admin)["sell(uint256[])"]([0, 1, 2, 6, 7, 8, 9, 10, 11]);
        await this.sp.connect(this.signers.admin)["sell(uint256)"](12);

        // Admin transfers 10000 tokens to Bob
        await this.sp.connect(this.signers.admin).transfer(this.signers.bob.address, su("10000"));
        // Bob tries to buy 10 NFTs with 10000 tokens in one tx should fail
        await this.furT.connect(this.signers.bob).approve(this.sp.address, su("1000"));
        await expect(
          this.sp.connect(this.signers.bob)["buy(uint256[])"]([0, 1, 2, 6, 7, 8, 9, 10, 11, 12]),
        ).to.be.revertedWith("SeparatePool: Can only buy 9 NFTs at once");
      });
    });

    context("Locking", async function () {
      it("should lock NFT", async function () {
        // Lock NFT for 1 cycle (30 days), check event emission
        await this.nft.connect(this.signers.bob).approve(this.sp.address, 3);
        await this.furT.connect(this.signers.bob).approve(this.sp.address, su("150"));
        await expect(this.sp.connect(this.signers.bob).lock(3, 1)).to.emit(this.sp, "LockedNFT");
        expect(await this.nft.ownerOf(3)).to.equal(this.sp.address);
        // Check release time
        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const timeOfLock: number = block.timestamp;
        const releaseTime: number = timeOfLock + 30 * 24 * 3600;
        expect(await this.sp.getReleaseTime(3)).to.equal(releaseTime);
        // Gets 500 F-NFT
        expect(await this.sp.balanceOf(this.signers.bob.address)).to.equal(su("500"));
        // Pays 150 FUR as fee, 1000 - 150 = 850 FUR
        expect(await this.furT.balanceOf(this.signers.bob.address)).to.equal(su("850"));
        // Admin is fee receiver, 1000 + 150 = 1150 FUR
        expect(await this.furT.balanceOf(this.signers.admin.address)).to.equal(su("1150"));
      });

      it("should extend NFT release time by paying before original release time", async function () {
        // Lock NFT for 1 cycle (30 days)
        await this.nft.connect(this.signers.bob).approve(this.sp.address, 3);
        await this.furT.connect(this.signers.bob).approve(this.sp.address, su("150"));
        await this.sp.connect(this.signers.bob).lock(3, 1);
        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const timeOfLock: number = block.timestamp;
        // Extend by one cycle (30 days)
        await this.furT.connect(this.signers.bob).approve(this.sp.address, su("150"));
        await this.sp.connect(this.signers.bob).payFee(3);
        // Pays 150 * 2 = 300 FUR as fees in total, 1000 - 300 = 700 FUR
        expect(await this.furT.balanceOf(this.signers.bob.address)).to.equal(su("700"));
        // Admin is fee receiver, 1000 + 300 = 1300 FUR
        expect(await this.furT.balanceOf(this.signers.admin.address)).to.equal(su("1300"));
        // Check extension
        const releaseTime: number = timeOfLock + 2 * 30 * 24 * 3600;
        expect(await this.sp.getReleaseTime(3)).to.equal(releaseTime);
      });

      it("should not allow extending of release time if original release time has passed", async function () {
        // Lock NFT for 1 cycle (30 days)
        await this.nft.connect(this.signers.bob).approve(this.sp.address, 3);
        await this.furT.connect(this.signers.bob).approve(this.sp.address, su("150"));
        await this.sp.connect(this.signers.bob).lock(3, 1);

        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const timeOfLock: number = block.timestamp;
        // 31 days after locking
        const timestamp: number = timeOfLock + 31 * 24 * 3600;
        await ethers.provider.send("evm_mine", [timestamp]);
        // Extend release time should fail
        await this.furT.connect(this.signers.bob).approve(this.sp.address, su("150"));
        await expect(this.sp.connect(this.signers.bob).payFee(3)).to.be.revertedWith(
          "SeparatePool: NFT has already been released to public pool.",
        );
      });
    });

    context("Redeeming", async function () {
      it("should redeem NFT within release time", async function () {
        // Bob locks two NFTs for 1 cycle (30 days), get 1000 tokens
        await this.nft.connect(this.signers.bob).approve(this.sp.address, 3);
        await this.nft.connect(this.signers.bob).approve(this.sp.address, 4);
        await this.furT.connect(this.signers.bob).approve(this.sp.address, su("300"));
        await this.sp.connect(this.signers.bob).lock(3, 1);
        await this.sp.connect(this.signers.bob).lock(4, 1);

        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const txTime: number = block.timestamp;
        // 7 days after locking
        const timestamp: number = txTime + 7 * 24 * 3600;
        await ethers.provider.send("evm_mine", [timestamp]);
        // Bob redeems 1 NFT, check event emission
        await expect(this.sp.connect(this.signers.bob).redeem(3)).to.emit(this.sp, "RedeemedNFT");
        expect(await this.nft.ownerOf(3)).to.equal(this.signers.bob.address);
        expect(await this.nft.ownerOf(4)).to.equal(this.sp.address);
        // 1000 - 500 = 500
        expect(await this.sp.balanceOf(this.signers.bob.address)).to.equal(su("500"));
      });

      it("should not redeem NFT if caller is not locker", async function () {
        // Bob locks NFT for 1 cycle (30 days), get 500 tokens
        await this.nft.connect(this.signers.bob).approve(this.sp.address, 3);
        await this.furT.connect(this.signers.bob).approve(this.sp.address, su("150"));
        await this.sp.connect(this.signers.bob).lock(3, 1);
        // Redeem NFT should fail
        await expect(this.sp.connect(this.signers.admin).redeem(3)).to.be.revertedWith(
          "SeparatePool: You did not lock this NFT.",
        );
      });

      it("should not redeem NFT after release time", async function () {
        // Bob locks NFT for 1 cycle (30 days), get 500 tokens
        await this.nft.connect(this.signers.bob).approve(this.sp.address, 3);
        await this.furT.connect(this.signers.bob).approve(this.sp.address, su("150"));
        await this.sp.connect(this.signers.bob).lock(3, 1);

        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const txTime: number = block.timestamp;
        // 31 days after locking
        const timestamp: number = txTime + 31 * 24 * 3600;
        await ethers.provider.send("evm_mine", [timestamp]);
        // Admin tries to redeem NFT should fail
        await expect(this.sp.connect(this.signers.bob).redeem(3)).to.be.revertedWith(
          "SeparatePool: NFT has already been released to public pool.",
        );
      });
    });

    // Admin is owner, only admin can release NFTs
    context("Releasing", async function () {
      it("should release NFT that has passed release time", async function () {
        // Bob locks NFT for 1 cycle (30 days)
        await this.nft.connect(this.signers.bob).approve(this.sp.address, 3);
        await this.furT.connect(this.signers.bob).approve(this.sp.address, su("150"));
        await this.sp.connect(this.signers.bob).lock(3, 1);

        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const timeOfLock: number = block.timestamp;
        // 31 days after locking
        const timestamp: number = timeOfLock + 31 * 24 * 3600;
        await ethers.provider.send("evm_mine", [timestamp]);
        // Admin releases Bob's NFT, making it available for buying, check event emission
        await expect(this.sp.connect(this.signers.admin).release(3)).to.emit(this.sp, "ReleasedNFT");
        // Bob gets remaining 500 F-NFT
        expect(await this.sp.balanceOf(this.signers.bob.address)).to.equal(su("1000"));
        // Admin sells own NFTs and gets 2000 tokens
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 0);
        await this.nft.connect(this.signers.admin).approve(this.sp.address, 1);
        await this.sp.connect(this.signers.admin)["sell(uint256[])"]([0, 1]);
        // Admin buys the released NFT owned by Bob originally
        await this.furT.connect(this.signers.admin).approve(this.sp.address, su("100"));
        await this.sp.connect(this.signers.admin)["buy(uint256)"](3);
        expect(await this.nft.ownerOf(3)).to.equal(this.signers.admin.address);
      });

      it("should not allow anyone other than owner to release NFT", async function () {
        // Bob locks NFT for 1 cycle (30 days)
        await this.nft.connect(this.signers.bob).approve(this.sp.address, 3);
        await this.furT.connect(this.signers.bob).approve(this.sp.address, su("150"));
        await this.sp.connect(this.signers.bob).lock(3, 1);

        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const timeOfLock: number = block.timestamp;
        // 31 days after locking
        const timestamp: number = timeOfLock + 31 * 24 * 3600;
        await ethers.provider.send("evm_mine", [timestamp]);
        // Alice tries to release Bob's NFT, should fail
        await expect(this.sp.connect(this.signers.alice).release(3)).to.be.revertedWith(
          "SeparatePool: Not permitted to call.",
        );
      });

      it("should not release NFT that has not passed release time", async function () {
        // Bob locks NFT for 1 cycle (30 days)
        await this.nft.connect(this.signers.bob).approve(this.sp.address, 3);
        await this.furT.connect(this.signers.bob).approve(this.sp.address, su("150"));
        await this.sp.connect(this.signers.bob).lock(3, 1);

        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const timeOfLock: number = block.timestamp;
        // 7 days after locking
        const timestamp: number = timeOfLock + 7 * 24 * 3600;
        await ethers.provider.send("evm_mine", [timestamp]);
        // Admin tries to release Bob's NFT, should fail
        await expect(this.sp.connect(this.signers.admin).release(3)).to.be.revertedWith(
          "SeparatePool: Release time not yet reached.",
        );
      });
    });
  });
});
