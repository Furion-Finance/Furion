import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { BigNumberish } from "ethers";

import {
  FarmingPool,
  FarmingPool__factory,
  FurionSwapFactory,
  FurionSwapFactory__factory,
  FurionSwapPair,
  FurionSwapPair__factory,
  FurionSwapV2Router,
  FurionSwapV2Router__factory,
  FurionToken,
  FurionToken__factory,
  MockERC20,
  MockERC20__factory,
  WETH9,
  WETH9__factory,
} from "../../typechain";
import {
  formatStablecoin,
  formatTokenAmount,
  getLatestBlockTimestamp,
  stablecoinToWei,
  toBN,
  toWei,
  zeroAddress,
} from "../utils";

chai.use(solidity);
const { expect } = chai;

const hre = require("hardhat");
const { ethers } = require("hardhat");

describe("Furion Farming Pools", function () {
  let farmingPool: FarmingPool;
  let erc: MockERC20, furion: FurionToken;
  let weth: WETH9;

  let factory: FurionSwapFactory, router: FurionSwapV2Router;
  let pair: FurionSwapPair, pairAddress: string;

  type PoolInfo = {
    lpToken: string;
    basicFurionPerSecond: BigNumberish;
    lastRewardTimestamp: BigNumberish;
    accFurionPerShare: BigNumberish;
  };

  let dev: SignerWithAddress, user1: SignerWithAddress, users: SignerWithAddress[];

  beforeEach(async () => {
    [dev, user1, ...users] = await ethers.getSigners();

    furion = await new FurionToken__factory(dev).deploy();
    erc = await new MockERC20__factory(dev).deploy();
    weth = await new WETH9__factory(dev).deploy();

    furion.deployed();
    erc.deployed();
    weth.deployed();

    // mint initial value, half or erc would be farmed directly, half to LP in furion-swap
    await erc.mint(user1.address, toWei("20000"));
    await furion.mintFurion(user1.address, toWei("10000"));

    factory = await new FurionSwapFactory__factory(dev).deploy(dev.address);
    await factory.deployed();

    router = await new FurionSwapV2Router__factory(dev).deploy(factory.address, weth.address);
    await router.deployed();

    await factory.createPair(furion.address, erc.address);
    pairAddress = await factory.getPair(furion.address, erc.address);
    const furionSwapPair = await ethers.getContractFactory("FurionSwapPair");
    pair = await furionSwapPair.attach(pairAddress);

    farmingPool = await new FarmingPool__factory(dev).deploy(furion.address);
    farmingPool.deployed();
    await furion.addMinter(farmingPool.address);
  });

  describe("Deployment", function () {
    it("should have the correct owner", async function () {
      expect(await farmingPool.owner()).to.equal(dev.address);
    });

    it("should have the correct Furion address", async function () {
      expect(await farmingPool.furion()).to.equal(furion.address);
    });

    it("should have the correct next pool id at first", async function () {
      expect(await farmingPool._nextPoolId()).to.equal(1);
    });

    it("should have the first pool with ID:0", async function () {
      const defaultPool: PoolInfo = await farmingPool.poolList(0);

      expect(defaultPool.lpToken).to.equal(zeroAddress());
      expect(defaultPool.basicFurionPerSecond).to.equal(0);
      expect(defaultPool.lastRewardTimestamp).to.equal(0);
      expect(defaultPool.accFurionPerShare).to.equal(0);
    });

    it("should have the correct pausable status", async function () {
      expect(await farmingPool.paused()).to.equal(false);
    });
  });

  describe("Owner Functions", function () {
    it("should be able to set the start block", async function () {
      await expect(farmingPool.setStartTimestamp(60000)).to.emit(farmingPool, "StartTimestampChanged").withArgs(60000);
    });

    it("should not be able to set start block after start mining", async function () {
      await farmingPool.add(pairAddress, toWei("5"), false);
      await expect(farmingPool.setStartTimestamp(60000)).to.be.revertedWith("ALREADY_HAVING_POOLS");
    });

    it("should be able to pause the contract", async function () {
      await expect(farmingPool.connect(user1).pause()).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(farmingPool.pause()).to.emit(farmingPool, "Paused").withArgs(dev.address);

      await expect(farmingPool.add(pairAddress, toWei("5"), false)).to.be.revertedWith("Pausable: paused");
    });

    it("should be able to unpause the contract", async function () {
      await farmingPool.pause();

      await expect(farmingPool.unpause()).to.emit(farmingPool, "Unpaused").withArgs(dev.address);

      await expect(farmingPool.add(pairAddress, toWei("5"), false)).to.emit(farmingPool, "NewPoolAdded");
    });

    it("should be able to add new pools", async function () {
      const blockTimestampBefore = await getLatestBlockTimestamp(ethers.provider);

      await expect(farmingPool.add(pairAddress, toWei("5"), false))
        .to.emit(farmingPool, "NewPoolAdded")
        .withArgs(pairAddress, toWei("5"));

      await expect(farmingPool.add(erc.address, toWei("6"), false))
        .to.emit(farmingPool, "NewPoolAdded")
        .withArgs(erc.address, toWei("6"));

      // Have the correct pool id
      const nextPoolId = await farmingPool._nextPoolId();
      expect(await farmingPool.poolMapping(pairAddress)).to.equal(nextPoolId.sub(2));
      expect(await farmingPool.poolMapping(erc.address)).to.equal(nextPoolId.sub(1));

      // Have correct pool infos
      const poolList = await farmingPool.getPoolList();

      // Pool 1: pair address
      const pool_1 = poolList[1];
      expect(pool_1.lpToken).to.equal(pairAddress);
      expect(pool_1.basicFurionPerSecond).to.equal(toWei("5"));
      expect(pool_1.lastRewardTimestamp).to.equal(blockTimestampBefore + 1);
      expect(pool_1.accFurionPerShare).to.equal(0);

      // Pool 2: erc token
      const pool_2 = poolList[2];
      expect(pool_2.lpToken).to.equal(erc.address);
      expect(pool_2.basicFurionPerSecond).to.equal(toWei("6"));
      expect(pool_2.lastRewardTimestamp).to.equal(blockTimestampBefore + 2);
      expect(pool_2.accFurionPerShare).to.equal(0);
    });

    it("should not be able to add two same pools", async function () {
      await farmingPool.add(pairAddress, toWei("5"), false);

      await expect(farmingPool.add(pairAddress, toWei("5"), false)).to.be.revertedWith("FARMING_POOL: ALREADY_IN_POOL");
    });

    it("should be able to set Furion reward of a pool", async function () {
      await farmingPool.add(pairAddress, toWei("5"), false);
      const poolId = await farmingPool.poolMapping(pairAddress);

      await expect(farmingPool.setFurionReward(poolId, toWei("10"), false))
        .to.emit(farmingPool, "FurionRewardChanged")
        .withArgs(poolId, toWei("10"));

      const poolList = await farmingPool.getPoolList();
      expect(poolList[poolId.toNumber()].basicFurionPerSecond).to.equal(toWei("10"));
    });

    it("should be able to stop a existing pool", async function () {
      await farmingPool.add(pairAddress, toWei("5"), false);

      const poolId = await farmingPool.poolMapping(pairAddress);

      const blockTimestampBefore = await getLatestBlockTimestamp(ethers.provider);

      await expect(farmingPool.setFurionReward(poolId, 0, false))
        .to.emit(farmingPool, "FarmingPoolStopped")
        .withArgs(poolId, blockTimestampBefore + 1);
    });

    it("should be able to restart a farming pool", async function () {
      await farmingPool.add(pairAddress, toWei("5"), false);
      const poolId = await farmingPool.poolMapping(pairAddress);

      // Stop a pool
      await farmingPool.setFurionReward(poolId, 0, false);

      const blockTimestampBefore = await getLatestBlockTimestamp(ethers.provider);

      // Restart
      await expect(farmingPool.setFurionReward(poolId, toWei("10"), false))
        .to.emit(farmingPool, "FarmingPoolStarted")
        .withArgs(poolId, blockTimestampBefore + 1);

      // Stop a pool
      await farmingPool.setFurionReward(poolId, 0, false);

      await expect(farmingPool.setFurionReward(poolId, toWei("10"), false))
        .to.emit(farmingPool, "FarmingPoolStarted")
        .withArgs(poolId, blockTimestampBefore + 3);
    });
  });

  describe("User Functions: Deposit, Redeem and Harvest", function () {
    beforeEach(async function () {
      // Add LP1, reward speed as 5 FUR per second
      await farmingPool.add(pairAddress, toWei("5"), false);

      // Add LP2, reward speed as 10 FUR per second
      await farmingPool.add(erc.address, toWei("10"), false);

      await furion.connect(user1).approve(router.address, toWei("100000"));
      await erc.connect(user1).approve(router.address, toWei("100000"));

      await pair.connect(user1).approve(farmingPool.address, toWei("1000"));
      await erc.connect(user1).approve(farmingPool.address, toWei("100000"));
    });

    it("should be able to deposit lptokens", async function () {
      const now = await getLatestBlockTimestamp(ethers.provider);
      await router
        .connect(user1)
        .addLiquidity(
          furion.address,
          erc.address,
          toWei("10000"),
          toWei("10000"),
          toWei("80"),
          stablecoinToWei("80"),
          user1.address,
          now + 100,
        );
      expect(await pair.balanceOf(user1.address)).to.above(toWei("1000"));

      await expect(farmingPool.connect(user1).stake(1, toWei("100")))
        .to.emit(farmingPool, "Stake")
        .withArgs(user1.address, 1, toWei("100"));

      // should be able to stake another token
      await expect(farmingPool.connect(user1).stake(2, toWei("10000")))
        .to.emit(farmingPool, "Stake")
        .withArgs(user1.address, 2, toWei("10000"));
    });

    it("should be able to get correct farming rewards", async function () {
      const now = await getLatestBlockTimestamp(ethers.provider);
      await router
        .connect(user1)
        .addLiquidity(
          furion.address,
          erc.address,
          toWei("10000"),
          toWei("10000"),
          toWei("80"),
          stablecoinToWei("80"),
          user1.address,
          now + 100,
        );
      await farmingPool.connect(user1).stake(1, toWei("100"));
      await farmingPool.connect(user1).stake(2, toWei("10000"));

      // Mine five blocks, BlockNumber += 5
      await mineBlocks(5);

      // 5 blocks reward: 5 * reward
      expect(await farmingPool.pendingFurion(1, user1.address)).to.equal(toWei("30"));
      expect(await farmingPool.pendingFurion(2, user1.address)).to.equal(toWei("50"));
    });

    it("should be able to get correct rewards when withdraw", async function () {
      const now = await getLatestBlockTimestamp(ethers.provider);
      await router
        .connect(user1)
        .addLiquidity(
          furion.address,
          erc.address,
          toWei("10000"),
          toWei("10000"),
          toWei("80"),
          stablecoinToWei("80"),
          user1.address,
          now + 100,
        );
      await farmingPool.connect(user1).stake(1, toWei("100"));
      await farmingPool.connect(user1).stake(2, toWei("10000"));
      expect(await erc.balanceOf(user1.address)).to.equal(0);
      expect(await furion.balanceOf(user1.address)).to.equal(0);

      // Mine five blocks, BlockNumber += 5
      await mineBlocks(5);

      await expect(farmingPool.connect(user1).withdraw(1, toWei("50")))
        .to.emit(farmingPool, "Withdraw")
        .withArgs(user1.address, 1, toWei("50"));

      // 7 block reward: 5 * 7 = 35
      expect(await furion.balanceOf(user1.address)).to.equal(toWei("35"));
    });

    it("should be able to get correct rewards when second deposit", async function () {
      const now = await getLatestBlockTimestamp(ethers.provider);
      await router
        .connect(user1)
        .addLiquidity(
          furion.address,
          erc.address,
          toWei("10000"),
          toWei("10000"),
          toWei("80"),
          stablecoinToWei("80"),
          user1.address,
          now + 100,
        );

      await farmingPool.connect(user1).stake(1, toWei("10"));

      await expect(farmingPool.connect(user1).stake(1, toWei("100")))
        .to.emit(farmingPool, "Stake")
        .withArgs(user1.address, 1, toWei("100"));

      // 1 block reward: 5 * 1 = 5
      expect(await furion.balanceOf(user1.address)).to.equal(toWei("5"));
    });

    it("should be able to get correct rewards after another user deposit", async function () {
      await farmingPool.connect(user1).stake(2, toWei("100"));

      await erc.mint(dev.address, toWei("1000"));
      await erc.approve(farmingPool.address, toWei("1000"));
      await farmingPool.stake(2, toWei("400"));

      // 3 blocks reward: 10 * 3 = 30
      expect(await farmingPool.pendingFurion(2, user1.address)).to.equal(toWei("30"));
      expect(await farmingPool.pendingFurion(2, dev.address)).to.equal(0);

      await mineBlocks(1);

      // 1 * 10 * 4 / (4 + 1)
      expect(await farmingPool.pendingFurion(2, dev.address)).to.equal(toWei("8"));

      //
      expect(await farmingPool.pendingFurion(2, user1.address)).to.equal(toWei("32"));
    });

    it("should be able to get correct rewards when harvest for self", async function () {
      const now = await getLatestBlockTimestamp(ethers.provider);
      await router
        .connect(user1)
        .addLiquidity(
          furion.address,
          erc.address,
          toWei("10000"),
          toWei("10000"),
          toWei("80"),
          stablecoinToWei("80"),
          user1.address,
          now + 100,
        );

      await farmingPool.connect(user1).stake(1, toWei("10"));

      // Mine five blocks
      // BlockNumber += 5
      await mineBlocks(5);

      // 6 blocks reward: 5 * 6 = 30
      expect(await farmingPool.connect(user1).harvest(1, user1.address))
        .to.emit(farmingPool, "Harvest")
        .withArgs(user1.address, user1.address, 1, toWei("30"));

      expect(await furion.balanceOf(user1.address)).to.equal(toWei("30"));
    });
  });
});

async function mineBlocks(blockNumber: number) {
  while (blockNumber > 0) {
    blockNumber--;
    await hre.network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
}
