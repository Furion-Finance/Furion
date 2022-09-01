import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai from "chai";
import { solidity } from "ethereum-waffle";

import { FurionToken, FurionToken__factory } from "../../typechain";

chai.use(solidity);
const { expect } = chai;

const { ethers } = require("hardhat");

describe("Furion Token", function () {
  let furionToken: FurionToken__factory, furion: FurionToken;
  let dev: SignerWithAddress, user1: SignerWithAddress, users: SignerWithAddress[];

  beforeEach(async function () {
    [dev, user1, ...users] = await ethers.getSigners();

    furionToken = await ethers.getContractFactory("FurionToken");
    furion = await furionToken.deploy();
    await furion.deployed();
  });

  it("should have the correct name and symbol", async function () {
    expect(await furion.name()).to.equal("FurionToken");
    expect(await furion.symbol()).to.equal("FUR");
  });

  it("should have the correct owner", async function () {
    expect(await furion.owner()).to.equal(dev.address);
  });

  it("should have a hard cap of 1 billion", async function () {
    expect(await furion.CAP()).to.equal(ethers.utils.parseUnits("1000000000"));
    await expect(furion.mintFurion(user1.address, ethers.utils.parseUnits("10000000000"))).to.revertedWith(
      "Exceeds the FUR cap (1 billion)",
    );
  });

  it("should work well with addMinter and mintFurion", async function () {
    let amount = "10";
    expect(await furion.isMinter(user1.address)).to.false;
    await expect(furion.connect(user1).mintFurion(users[2].address, amount)).to.revertedWith("Invalid minter");

    await furion.addMinter(user1.address);
    expect(await furion.isMinter(user1.address)).to.true;

    await furion.connect(user1).mintFurion(users[2].address, amount);
    expect(await furion.totalSupply()).to.equal(amount);
    expect(await furion.balanceOf(users[2].address)).to.equals(amount);
  });

  it("should work well with addBurner and burnFurion", async function () {
    let mintAmount = "100",
      burnAmount = "10";
    await furion.mintFurion(dev.address, mintAmount);
    expect(await furion.balanceOf(dev.address)).to.equal(mintAmount);

    expect(await furion.isBurner(user1.address)).to.false;
    await expect(furion.connect(user1).burnFurion(dev.address, burnAmount)).to.revertedWith("Invalid burner");

    await furion.addBurner(user1.address);
    expect(await furion.isBurner(user1.address)).to.true;

    await furion.connect(user1).burnFurion(dev.address, burnAmount);
    expect(await furion.totalSupply()).to.equal("90");
  });

  it("should be able to transfer the ownership", async function () {
    await furion.transferOwnership(user1.address);

    expect(await furion.owner()).to.equal(user1.address);
  });

  it("should be able to renounce the ownership", async function () {
    await furion.renounceOwnership();

    expect(await furion.owner()).to.equal(ethers.constants.AddressZero);
  });
});
