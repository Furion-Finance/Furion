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
// bob: two NFT (3, 4), one NFT1 (1)
// alice: one NFT (5), one NFT1 (2)

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

    context("Deployment", async function () {
      it("should deploy with correct admin", async function () {
        expect(await this.ppf.owner()).to.equal(this.signers.admin.address);
      });
    });

    context("Pool Creation", async function () {
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

      it("should create different pools for different NFT collections", async function () {
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

    xcontext("Selling", async function () {
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

    xcontext("Buying", async function () {
      it("should buy NFT", async function () {
        // Sell two NFTs, gets 2000 pool tokens
        await this.nft.connect(this.signers.admin).approve(this.pool.address, 0);
        await this.nft.connect(this.signers.admin).approve(this.pool.address, 1);
        await this.pool.connect(this.signers.admin)["sell(uint256[])"]([0, 1]);
        // Transfer tokens to Bob
        await this.pool.connect(this.signers.admin).transfer(this.signers.bob.address, su("2000"));
        // Bob buys one NFT with 1010 (1% fee) tokens, check event emission
        await expect(this.pool.connect(this.signers.bob)["buy(uint256)"](0)).to.emit(this.pool, "BoughtNFT");
        // 2000 - 1000 (cost) - 10 (fee) = 990
        expect(await this.pool.balanceOf(this.signers.bob.address)).to.equal(su("990"));
        // Admin is fee reveiver
        expect(await this.pool.balanceOf(this.signers.admin.address)).to.equal(su("10"));
        expect(await this.nft.ownerOf(0)).to.equal(this.signers.bob.address);
      });

      it("should buy multiple NFTs in one tx", async function () {
        // Sell three NFTs, gets 2000 pool tokens
        await this.nft.connect(this.signers.admin).approve(this.pool.address, 0);
        await this.nft.connect(this.signers.admin).approve(this.pool.address, 1);
        await this.nft.connect(this.signers.admin).approve(this.pool.address, 2);
        await this.pool.connect(this.signers.admin)["sell(uint256[])"]([0, 1, 2]);
        // Transfer tokens to Bob
        await this.pool.connect(this.signers.admin).transfer(this.signers.bob.address, su("3000"));
        // Bob buys two NFTs with 2020 (1% fee) tokens
        await this.pool.connect(this.signers.bob)["buy(uint256[])"]([0, 1]);
        // 3000 - 2000 (cost) - 20 (fee) = 980
        expect(await this.pool.balanceOf(this.signers.bob.address)).to.equal(su("980"));
        // Admin is fee reveiver
        expect(await this.pool.balanceOf(this.signers.admin.address)).to.equal(su("20"));
        expect(await this.nft.ownerOf(0)).to.equal(this.signers.bob.address);
        expect(await this.nft.ownerOf(1)).to.equal(this.signers.bob.address);
      });
    });

    context("Locking", async function () {
      it("should lock NFT", async function () {
        await this.nft.connect(this.signers.bob).approve(this.pool.address, 3);
        // Lock NFT for 1 cycle (30 days), check event emission
        await expect(this.pool.connect(this.signers.bob).lock(3, 1)).to.emit(this.pool, "LockedNFT");
        expect(await this.nft.ownerOf(3)).to.equal(this.pool.address);
        // Check release time
        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const timeOfLock: number = block.timestamp;
        const releaseTime: number = timeOfLock + 30 * 24 * 3600;
        expect(await this.pool.getReleaseTime(3)).to.equal(releaseTime);
        // 500 - 15 (3% fee) = 485
        expect(await this.pool.balanceOf(this.signers.bob.address)).to.equal(su("485"));
        // Admin is fee receiver
        expect(await this.pool.balanceOf(this.signers.admin.address)).to.equal(su("15"));
      });

      it("should extend NFT release time by paying before original release time", async function () {
        // Lock NFT for 1 cycle (30 days)
        await this.nft.connect(this.signers.bob).approve(this.pool.address, 3);
        await this.pool.connect(this.signers.bob).lock(3, 1);
        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const timeOfLock: number = block.timestamp;
        // Extend by one cycle (30 days)
        await this.pool.connect(this.signers.bob).payFee(3);
        const releaseTime: number = timeOfLock + 2 * 30 * 24 * 3600;
        expect(await this.pool.getReleaseTime(3)).to.equal(releaseTime);
      });

      it("should not allow extending of release time if original release time has passed", async function () {
        // Lock NFT for 1 cycle (30 days)
        await this.nft.connect(this.signers.bob).approve(this.pool.address, 3);
        await this.pool.connect(this.signers.bob).lock(3, 1);
        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const timeOfLock: number = block.timestamp;
        // 31 days after locking
        const timestamp: number = timeOfLock + 31 * 24 * 3600;
        await ethers.provider.send("evm_mine", [timestamp]);
        // Extend release time should fail
        await expect(this.pool.connect(this.signers.bob).payFee(3)).to.be.revertedWith(
          "ProjectPool: NFT has already been released to public pool.",
        );
      });
    });

    context("Redeeming", async function () {
      it("should redeem NFT within release time", async function () {
        await this.nft.connect(this.signers.bob).approve(this.pool.address, 3);
        await this.nft.connect(this.signers.bob).approve(this.pool.address, 4);
        // Lock NFTs for 1 cycle (30 days), get 970 tokens
        await this.pool.connect(this.signers.bob).lock(3, 1);
        await this.pool.connect(this.signers.bob).lock(4, 1);
        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const txTime: number = block.timestamp;
        // 7 days after locking
        const timestamp: number = txTime + 7 * 24 * 3600;
        await ethers.provider.send("evm_mine", [timestamp]);
        // Redeem NFT, check event emission
        await expect(this.pool.connect(this.signers.bob).redeem(3)).to.emit(this.pool, "RedeemedNFT");
        expect(await this.nft.ownerOf(3)).to.equal(this.signers.bob.address);
        // 970 - 500 = 470
        expect(await this.pool.balanceOf(this.signers.bob.address)).to.equal(su("470"));
      });

      it("should not redeem NFT if caller is not locker", async function () {
        // Lock NFTs for 1 cycle (30 days), get 970 tokens
        await this.nft.connect(this.signers.bob).approve(this.pool.address, 3);
        await this.pool.connect(this.signers.bob).lock(3, 1);
        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const txTime: number = block.timestamp;
        // 7 days after locking
        const timestamp: number = txTime + 7 * 24 * 3600;
        await ethers.provider.send("evm_mine", [timestamp]);
        // Redeem NFT should fail
        await expect(this.pool.connect(this.signers.admin).redeem(3)).to.be.revertedWith(
          "ProjectPool: You did not lock this NFT.",
        );
      });

      it("should not redeem NFT after release time", async function () {
        // Lock NFTs for 1 cycle (30 days), get 970 tokens
        await this.nft.connect(this.signers.bob).approve(this.pool.address, 3);
        await this.pool.connect(this.signers.bob).lock(3, 1);
        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const txTime: number = block.timestamp;
        // 31 days after locking
        const timestamp: number = txTime + 31 * 24 * 3600;
        await ethers.provider.send("evm_mine", [timestamp]);
        // Redeem NFT should fail
        await expect(this.pool.connect(this.signers.bob).redeem(3)).to.be.revertedWith(
          "ProjectPool: NFT has already been released to public pool.",
        );
      });
    });

    // Admin is owner, only admin can release NFTs
    context("Releasing", async function () {
      it("should release NFT that has passed release time", async function () {
        // Bob locks NFT for 1 cycle (30 days)
        await this.nft.connect(this.signers.bob).approve(this.pool.address, 3);
        await this.pool.connect(this.signers.bob).lock(3, 1);
        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const timeOfLock: number = block.timestamp;
        // 31 days after locking
        const timestamp: number = timeOfLock + 31 * 24 * 3600;
        await ethers.provider.send("evm_mine", [timestamp]);
        // Admin releases Bob's NFT, making it available for buying, check event emission
        await expect(this.pool.connect(this.signers.admin).release(3)).to.emit(this.pool, "ReleasedNFT");
        // Admin sells own NFTs and gets 2000 tokens
        await this.nft.connect(this.signers.admin).approve(this.pool.address, 0);
        await this.nft.connect(this.signers.admin).approve(this.pool.address, 1);
        await this.pool.connect(this.signers.admin)["sell(uint256[])"]([0, 1]);
        // Admin buys the released NFT
        await this.pool.connect(this.signers.admin)["buy(uint256)"](3);
        expect(await this.nft.ownerOf(3)).to.equal(this.signers.admin.address);
      });

      it("should not allow anyone other than owner to release NFT", async function () {
        // Bob locks NFT for 1 cycle (30 days)
        await this.nft.connect(this.signers.bob).approve(this.pool.address, 3);
        await this.pool.connect(this.signers.bob).lock(3, 1);
        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const timeOfLock: number = block.timestamp;
        // 31 days after locking
        const timestamp: number = timeOfLock + 31 * 24 * 3600;
        await ethers.provider.send("evm_mine", [timestamp]);
        // Alice tries to release Bob's NFT, should fail
        await expect(this.pool.connect(this.signers.alice).release(3)).to.be.revertedWith(
          "ProjectPool: Not permitted to call.",
        );
      });

      it("should not release NFT that has not passed release time", async function () {
        // Bob locks NFT for 1 cycle (30 days)
        await this.nft.connect(this.signers.bob).approve(this.pool.address, 3);
        await this.pool.connect(this.signers.bob).lock(3, 1);
        const blockNum: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const timeOfLock: number = block.timestamp;
        // 7 days after locking
        const timestamp: number = timeOfLock + 7 * 24 * 3600;
        await ethers.provider.send("evm_mine", [timestamp]);
        // Admin tries to release Bob's NFT, should fail
        await expect(this.pool.connect(this.signers.admin).release(3)).to.be.revertedWith(
          "ProjectPool: Release time not yet reached.",
        );
      });
    });
  });
});
