import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { formatEther, parseUnits } from "ethers/lib/utils";

import {
  FurionToken,
  FurionToken__factory,
  MockUSD,
  MockUSD__factory,
  VoteEscrowedFurion,
  VoteEscrowedFurion__factory,
} from "../../typechain";
import { customErrorMsg, getLatestBlockTimestamp, stablecoinToWei, toWei, zeroAddress } from "../utils";

chai.use(solidity);
const { expect } = chai;

const hre = require("hardhat");
const { ethers } = require("hardhat");

describe("Vote Escrowed Furion", function () {
  let furionToken: FurionToken__factory, furion: FurionToken;
  let mockUSD: MockUSD__factory, usd: MockUSD;
  let veFURToken: VoteEscrowedFurion__factory, veFUR: VoteEscrowedFurion;

  let dev: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress;

  beforeEach(async function () {
    [dev, user1, user2] = await ethers.getSigners();

    mockUSD = await ethers.getContractFactory("MockUSD");
    usd = await mockUSD.deploy();

    furionToken = await ethers.getContractFactory("FurionToken");
    furion = await furionToken.deploy();

    veFURToken = await ethers.getContractFactory("VoteEscrowedFurion");
    veFUR = await veFURToken.deploy();
    await veFUR.deployed();

    // Initialize veFUR
    await veFUR.initialize(furion.address);
  });

  describe("Deployment", function () {
    it("should have the correct owner", async function () {
      expect(await veFUR.owner()).to.equal(dev.address);
    });
    it("should have the correct generation rate", async function () {
      expect(await veFUR.generationRate()).to.equal(toWei("1"));
    });

    it("should have the correct mat cap ratio", async function () {
      expect(await veFUR.maxCapRatio()).to.equal(100);
    });
  });

  describe("Owner Functions", function () {
    it("should be able to change the generation rate", async function () {
      await expect(veFUR.setGenerationRate(toWei("2")))
        .to.emit(veFUR, "GenerationRateChanged")
        .withArgs(toWei("1"), toWei("2"));
    });
    it("should be able to change the max cap ratio", async function () {
      await expect(veFUR.setMaxCapRatio(50)).to.emit(veFUR, "MaxCapRatioChanged").withArgs(100, 50);
    });
    it("should be able to add and remove whitelist address", async function () {
      await expect(veFUR.addWhitelist(user1.address)).to.emit(veFUR, "WhiteListAdded").withArgs(user1.address);

      await expect(veFUR.removeWhitelist(user1.address)).to.emit(veFUR, "WhiteListRemoVEF").withArgs(user1.address);
    });
  });

  describe("Deposit and Claim", function () {
    let lockedStart: number;
    let lockedUntil: number;
    beforeEach(async function () {
      await furion.mintFurion(dev.address, toWei("1000"));
      await furion.approve(veFUR.address, toWei("1000"));
    });
    it("should be able to deposit FUR tokens", async function () {
      await expect(veFUR.deposit(toWei("100")))
        .to.emit(veFUR, "Deposit")
        .withArgs(dev.address, toWei("100"));

      expect(await furion.balanceOf(dev.address)).to.equal(toWei("900"));

      const currentTime = await getLatestBlockTimestamp(ethers.provider);

      const userInfo = await veFUR.users(dev.address);
      expect(userInfo.amount).to.equal(toWei("100"));
      expect(userInfo.lastRelease).to.equal(currentTime);

      // 10 blocks reward = 10 * 1 * 100 = 1000
      await mineBlocks(10);
      expect(await veFUR.claimable(dev.address)).to.equal(toWei("1000"));

      await mineBlocks(990);
      expect(await veFUR.claimable(dev.address)).to.equal(toWei("10000"));

      await mineBlocks(10);
      expect(await veFUR.claimable(dev.address)).to.equal(toWei("10000"));
    });

    it("should be able to deposit FUR tokens multiple times", async function () {
      await expect(veFUR.deposit(toWei("100")))
        .to.emit(veFUR, "Deposit")
        .withArgs(dev.address, toWei("100"));

      await veFUR.deposit(toWei("100"));

      expect(await veFUR.claimable(dev.address)).to.equal(0);
      expect(await veFUR.balanceOf(dev.address)).to.equal(toWei("100"));
    });

    it("should be able to claim the veFUR reward", async function () {
      await veFUR.deposit(toWei("100"));

      await mineBlocks(9);
      await veFUR.claim();

      expect(await veFUR.balanceOf(dev.address)).to.equal(toWei("1000"));

      await mineBlocks(989);
      await veFUR.claim();
      expect(await veFUR.balanceOf(dev.address)).to.equal(toWei("10000"));

      await mineBlocks(50);
      await veFUR.claim();
      expect(await veFUR.balanceOf(dev.address)).to.equal(toWei("10000"));
    });

    it("should be able to withdraw FUR tokens", async function () {
      await veFUR.deposit(toWei("100"));

      await mineBlocks(10);
      expect(await veFUR.claimable(dev.address)).to.equal(toWei("1000"));

      const currentTime = await getLatestBlockTimestamp(ethers.provider);
      await setNextBlockTime(currentTime + 10);

      await expect(veFUR.withdraw(toWei("100")))
        .to.emit(veFUR, "Withdraw")
        .withArgs(dev.address, toWei("100"));

      // veFUR balance should be 0 after withdraw
      expect(await veFUR.balanceOf(dev.address)).to.equal(0);

      expect(await furion.balanceOf(dev.address)).to.equal(toWei("1000"));
    });

    it("should be able to stake for max time", async function () {
      await veFUR.depositMaxTime(toWei("100"));

      expect(await furion.balanceOf(dev.address)).to.equal(toWei("900"));

      const currentTime = await getLatestBlockTimestamp(ethers.provider);

      const userInfo = await veFUR.users(dev.address);

      const generationRate = await veFUR.generationRate();
      const maxCapRatio = await veFUR.maxCapRatio();
      const SCALE = await veFUR.SCALE();

      const maxLockTime = maxCapRatio.mul(SCALE).div(generationRate);

      expect(userInfo.amountLocked).to.equal(toWei("100"));
      expect(userInfo.lockUntil).to.equal(currentTime + 2 * maxLockTime.toNumber());

      expect(await veFUR.balanceOf(dev.address)).to.equal(toWei("10000"));
    });

    it("should be able to have mixed deposit", async function () {
      await veFUR.deposit(toWei("100"));
      const firstDepositTime = await getLatestBlockTimestamp(ethers.provider);
      await veFUR.depositMaxTime(toWei("100"));
      const secondDepositTime = await getLatestBlockTimestamp(ethers.provider);

      // console.log(secondDepositTime - firstDepositTime);

      const generationRate = await veFUR.generationRate();
      const maxCapRatio = await veFUR.maxCapRatio();
      const SCALE = await veFUR.SCALE();

      const maxLockTime = maxCapRatio.mul(SCALE).div(generationRate);

      expect(await furion.balanceOf(dev.address)).to.equal(toWei("800"));

      const userInfo = await veFUR.users(dev.address);
      expect(userInfo.amount).to.equal(toWei("100"));
      expect(userInfo.amountLocked).to.equal(toWei("100"));
      expect(userInfo.lastRelease).to.equal(firstDepositTime);
      expect(userInfo.lockUntil).to.equal(firstDepositTime + 1 + 2 * maxLockTime.toNumber());

      expect(await veFUR.balanceOf(dev.address)).to.equal(toWei("10000"));

      // await mineBlocks(2);
      await veFUR.claim();
      expect(await veFUR.balanceOf(dev.address)).to.equal(toWei("10200"));
    });

    it("should be able to only withdraw flexible deposit", async function () {
      await veFUR.deposit(toWei("100"));
      await veFUR.depositMaxTime(toWei("100"));

      expect(await veFUR.balanceOf(dev.address)).to.equal(toWei("10000"));
      expect(await veFUR.claimable(dev.address)).to.equal(toWei("100"));

      await veFUR.withdraw(toWei("100"));

      // Still have the locked part
      expect(await veFUR.balanceOf(dev.address)).to.equal(toWei("10000"));
    });

    it("should be able to withdraw locked part", async function () {
      await veFUR.deposit(toWei("100"));
      await veFUR.depositMaxTime(toWei("100"));
      expect(await furion.balanceOf(dev.address)).to.equal(toWei("800"));

      lockedStart = await getLatestBlockTimestamp(ethers.provider);

      lockedUntil = lockedStart + 200;

      // console.log(lockedUntil);

      await setNextBlockTime(lockedUntil);

      await veFUR.withdrawLocked();

      expect(await furion.balanceOf(dev.address)).to.equal(toWei("900"));

      // Max amount
      expect(await veFUR.claimable(dev.address)).to.equal(toWei("10000"));

      await veFUR.claim();

      await veFUR.withdraw(toWei("100"));
      expect(await veFUR.balanceOf(dev.address)).to.equal(0);
    });
  });

  describe("Whitelist contract burn veFUR", function () {
    beforeEach(async function () {
      await furion.mintFurion(dev.address, toWei("1000"));
      await furion.approve(veFUR.address, toWei("1000"));

      await veFUR.addWhitelist(user1.address);
    });
    it("should be able to burn veFUR as entrance", async function () {
      await veFUR.deposit(toWei("100"));

      await mineBlocks(100);
      await veFUR.claim();

      expect(await veFUR.balanceOf(dev.address)).to.equal(toWei("10000"));

      await veFUR.connect(user1).burnVeFUR(dev.address, toWei("100"));

      // Burn veFUR => balance decrease
      expect(await veFUR.balanceOf(dev.address)).to.equal(toWei("9900"));

      // Balance less than max amount after the burn
      // So it will restart to gain veFUR
      await mineBlocks(1);
      expect(await veFUR.claimable(dev.address)).to.equal(toWei("100"));

      // Also can not exceed the max amount
      await mineBlocks(10);
      expect(await veFUR.claimable(dev.address)).to.equal(toWei("100"));

      // Burn for the second time
      await veFUR.connect(user1).burnVeFUR(dev.address, toWei("100"));
      expect(await veFUR.claimable(dev.address)).to.equal(toWei("200"));

      await mineBlocks(1);
      expect(await veFUR.claimable(dev.address)).to.equal(toWei("200"));

      // After claim, balance back to max amount
      await veFUR.claim();
      expect(await veFUR.balanceOf(dev.address)).to.equal(toWei("10000"));
    });
  });

  describe("Whitelist contract lock veFUR", function () {
    beforeEach(async function () {
      await furion.mintFurion(dev.address, toWei("1000"));
      await furion.approve(veFUR.address, toWei("1000"));

      await veFUR.addWhitelist(user1.address);
    });

    it("should not be able to lock & unlock veFUR by accounts other than whitelist", async function () {
      await veFUR.deposit(toWei("100"));

      // Owner can not lock
      await expect(veFUR.lockVeFUR(dev.address, toWei("100"))).to.be.revertedWith(
        customErrorMsg("'VEF__NotWhiteListed()'"),
      );

      await expect(veFUR.unlockVeFUR(dev.address, toWei("100"))).to.be.revertedWith(
        customErrorMsg("'VEF__NotWhiteListed()'"),
      );

      // Not whitelisted accounts can not lock
      await expect(veFUR.connect(user2).lockVeFUR(dev.address, toWei("100"))).to.be.revertedWith(
        customErrorMsg("'VEF__NotWhiteListed()'"),
      );

      await expect(veFUR.connect(user2).unlockVeFUR(dev.address, toWei("100"))).to.be.revertedWith(
        customErrorMsg("'VEF__NotWhiteListed()'"),
      );
    });

    it("should be able to lock and unlock veFUR", async function () {
      await veFUR.deposit(toWei("100"));

      await veFUR.claim();
      expect(await veFUR.balanceOf(dev.address)).to.equal(toWei("100"));

      await expect(veFUR.connect(user1).lockVeFUR(dev.address, toWei("100")))
        .to.emit(veFUR, "LockVeFUR")
        .withArgs(user1.address, dev.address, toWei("100"));

      // Check lock status
      expect(await veFUR.locked(dev.address)).to.equal(toWei("100"));

      // Can not withdraw when locked
      await expect(veFUR.withdraw(toWei("100"))).to.be.revertedWith(customErrorMsg("'VEF__StillLocked()'"));

      await expect(veFUR.connect(user1).unlockVeFUR(dev.address, toWei("100")))
        .to.emit(veFUR, "UnlockVeFUR")
        .withArgs(user1.address, dev.address, toWei("100"));

      // Can withdraw after unlock
      await veFUR.withdraw(toWei("100"));
      expect(await furion.balanceOf(dev.address)).to.equal(toWei("1000"));
      expect(await veFUR.balanceOf(dev.address)).to.equal(0);
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

// hre can be used in hardhat environment but not with mocha built-in test
async function setNextBlockTime(time: number) {
  await hre.network.provider.request({
    method: "evm_setNextBlockTimestamp",
    params: [time],
  });
}
