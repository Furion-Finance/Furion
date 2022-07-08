import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { Checker } from "../../src/types/contracts/Checker";
import type { ProjectPoolFactory } from "../../src/types/contracts/project-pool/ProjectPoolFactory";
import type { RootPoolFactory } from "../../src/types/contracts/root-pool/RootPoolFactory";
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
    const ppfArtifact: Artifact = await artifacts.readArtifact("ProjectPoolFactory");
    this.ppf = <ProjectPoolFactory>(
      await waffle.deployContract(this.signers.admin, ppfArtifact, [this.checker.address, this.furT.address])
    );

    // Deploy root pool factory
    const rpfArtifact: Artifact = await artifacts.readArtifact("RootPoolFactory");
    this.rpf = <RootPoolFactory>await waffle.deployContract(this.signers.admin, rpfArtifact, [this.checker.address]);
  });

  it("should only allow owner to set factories", async function () {
    await expect(this.checker.connect(this.signers.bob).setPPFactory(this.ppf.address)).to.be.revertedWith(
      "Ownable: caller is not the owner",
    );
    await expect(this.checker.connect(this.signers.bob).setRPFactory(this.rpf.address)).to.be.revertedWith(
      "Ownable: caller is not the owner",
    );
    await this.checker.connect(this.signers.admin).setPPFactory(this.ppf.address);
    await this.checker.connect(this.signers.admin).setRPFactory(this.rpf.address);

    expect(await this.checker.PP_FACTORY()).to.equal(this.ppf.address);
    expect(await this.checker.RP_FACTORY()).to.equal(this.rpf.address);
  });

  it("should only allow owner and factories to add tokens", async function () {
    await this.checker.connect(this.signers.admin).setPPFactory(this.ppf.address);
    await this.checker.connect(this.signers.admin).setRPFactory(this.rpf.address);

    await expect(this.checker.connect(this.signers.bob).addToken(this.furT.address)).to.be.revertedWith(
      "Checker: Not permitted to call.",
    );
    await this.checker.connect(this.signers.admin).addToken(this.furT.address);
    expect(await this.checker.isFurionToken(this.furT.address)).to.equal(true);

    const pp = await this.ppf.callStatic.createPool(this.nft.address);
    await this.ppf.createPool(this.nft.address);
    expect(await this.checker.isFurionToken(pp)).to.equal(true);

    const rp = await this.rpf.callStatic.createPool([pp]);
    await this.rpf.createPool([pp]);
    expect(await this.checker.isFurionToken(rp)).to.equal(true);
  });
});
