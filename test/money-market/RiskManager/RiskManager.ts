import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Signers } from "../../types";
import { adminTest } from "./RiskManager.admin";
import { deployRiskManagerFixture } from "./RiskManager.fixture";
import { marketTest } from "./RiskManager.market";

describe("RiskManager", function () {
  // Signers declaration
  before(async function () {
    this.signers = {} as Signers;
    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.bob = signers[1];

    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    const { spo, rm, nirm, feth } = await this.loadFixture(deployRiskManagerFixture);
    this.spo = spo;
    this.rm = rm;
    this.nirm = nirm;
    this.feth = feth;
  });

  adminTest();

  marketTest();
});
