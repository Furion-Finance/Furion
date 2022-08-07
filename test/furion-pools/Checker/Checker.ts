import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";

import { Signers } from "../../types";
import { deployCheckerFixture } from "./Checker.fixture";

describe("Checker", async function () {
  // Signers declaration
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.bob = signers[1];
    this.signers.alice = signers[2];

    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    const { nft, furT, checker, spf, apf } = await this.loadFixture(deployCheckerFixture);
    this.nft = nft;
    this.furT = furT;
    this.checker = checker;
    this.spf = spf;
    this.apf = apf;
  });

  it("should only allow owner to set factories", async function () {
    await expect(this.checker.connect(this.signers.bob).setSPFactory(this.spf.address)).to.be.revertedWith(
      "Ownable: caller is not the owner",
    );
    await expect(this.checker.connect(this.signers.bob).setAPFactory(this.apf.address)).to.be.revertedWith(
      "Ownable: caller is not the owner",
    );
    await this.checker.connect(this.signers.admin).setSPFactory(this.spf.address);
    await this.checker.connect(this.signers.admin).setAPFactory(this.apf.address);

    expect(await this.checker.SP_FACTORY()).to.equal(this.spf.address);
    expect(await this.checker.AP_FACTORY()).to.equal(this.apf.address);
  });

  it("should only allow owner and factories to add tokens", async function () {
    await this.checker.connect(this.signers.admin).setSPFactory(this.spf.address);
    await this.checker.connect(this.signers.admin).setAPFactory(this.apf.address);

    await expect(this.checker.connect(this.signers.bob).addToken(this.furT.address)).to.be.revertedWith(
      "Checker: Not permitted to call.",
    );
    await this.checker.connect(this.signers.admin).addToken(this.furT.address);
    expect(await this.checker.isFurionToken(this.furT.address)).to.equal(true);

    const sp = await this.spf.callStatic.createPool(this.nft.address);
    await this.spf.createPool(this.nft.address);
    expect(await this.checker.isFurionToken(sp)).to.equal(true);

    const ap = await this.apf.callStatic.createPool([sp]);
    await this.apf.createPool([sp]);
    expect(await this.checker.isFurionToken(ap)).to.equal(true);
  });
});
