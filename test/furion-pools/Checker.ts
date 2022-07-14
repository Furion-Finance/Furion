import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { Checker } from "../../src/types/contracts/Checker";
import type { AggregatePoolFactory } from "../../src/types/contracts/aggregate-pool/AggregatePoolFactory";
import type { SeparatePoolFactory } from "../../src/types/contracts/separate-pool/SeparatePoolFactory";
import type { FurionTokenTest } from "../../src/types/contracts/test-only/FurionTokenTest";
import type { NFTest } from "../../src/types/contracts/test-only/NFTest";
import { Signers } from "../types";

describe("Checker", async function () {
  // Signers declaration
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.bob = signers[1];
    this.signers.alice = signers[2];
  });

  beforeEach(async function () {
    const nftArtifact: Artifact = await artifacts.readArtifact("NFTest");
    this.nft = <NFTest>await waffle.deployContract(this.signers.admin, nftArtifact, [[this.signers.admin.address]]);

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
  });

  it("should only allow owner to set factories", async function () {
    await expect(this.checker.connect(this.signers.bob).setPPFactory(this.spf.address)).to.be.revertedWith(
      "Ownable: caller is not the owner",
    );
    await expect(this.checker.connect(this.signers.bob).setRPFactory(this.apf.address)).to.be.revertedWith(
      "Ownable: caller is not the owner",
    );
    await this.checker.connect(this.signers.admin).setPPFactory(this.spf.address);
    await this.checker.connect(this.signers.admin).setRPFactory(this.apf.address);

    expect(await this.checker.PP_FACTORY()).to.equal(this.spf.address);
    expect(await this.checker.RP_FACTORY()).to.equal(this.apf.address);
  });

  it("should only allow owner and factories to add tokens", async function () {
    await this.checker.connect(this.signers.admin).setPPFactory(this.spf.address);
    await this.checker.connect(this.signers.admin).setRPFactory(this.apf.address);

    await expect(this.checker.connect(this.signers.bob).addToken(this.furT.address)).to.be.revertedWith(
      "Checker: Not permitted to call.",
    );
    await this.checker.connect(this.signers.admin).addToken(this.furT.address);
    expect(await this.checker.isFurionToken(this.furT.address)).to.equal(true);

    const pp = await this.spf.callStatic.createPool(this.nft.address);
    await this.spf.createPool(this.nft.address);
    expect(await this.checker.isFurionToken(pp)).to.equal(true);

    const rp = await this.apf.callStatic.createPool([pp]);
    await this.apf.createPool([pp]);
    expect(await this.checker.isFurionToken(rp)).to.equal(true);
  });
});
