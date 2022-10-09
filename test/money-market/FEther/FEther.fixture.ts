import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers, upgrades } from "hardhat";

import { deploy, deployUpgradeable } from "../../utils";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export async function deployFEtherFixture(): Promise<{
  checker: Checker;
  spo: SimplePriceOracle;
  rm: RiskManager;
  nirm: NormalInterestRateModel;
  feth: FEther;
  ffur: FErc20;
}> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];
  const alice: SignerWithAddress = signers[2];

  // Deploy FUR
  const fur = await deploy("FurionTokenTest", [[admin.address, alice.address]]);

  // Deploy veFUR
  const veFur = await deployUpgradeable("VoteEscrowedFurion", [fur.address]);

  // Deploy Checker
  const checker = await deploy("Checker", []);

  // Deploy Price Oracle
  const spo = await deploy("SimplePriceOracle", []);

  // Deploy Risk Manager
  const rm = await deployUpgradeable("RiskManager", [spo.address]);

  // Deploy interest rate model
  const nirm = await deploy("NormalInterestRateModel", [mantissa("0.03"), mantissa("0.2")]);

  // Deploy fETH
  const feth = await deployUpgradeable("FEther", [rm.address, nirm.address, spo.address, checker.address]);

  // Deploy fFUR
  const ffur = await deployUpgradeable("FErc20", [
    fur.address,
    rm.address,
    nirm.address,
    spo.address,
    checker.address,
    "Furion FUR",
    "fFUR",
  ]);

  await fur.connect(admin).approve(ffur.address, mantissa("1000"));
  await fur.connect(alice).approve(ffur.address, mantissa("1000"));
  // Set close factor
  await rm.connect(admin).setCloseFactor(mantissa("0.5"));
  // Set fETH, fFUR market underlying price ($1700, $17000, $2)
  await spo.connect(admin).setUnderlyingPrice(feth.address, mantissa("1700"), mantissa("1"));
  await spo.connect(admin).setUnderlyingPrice(ffur.address, mantissa("2"), mantissa("1"));
  // List fETH, fFUR market
  await rm.connect(admin).supportMarket(feth.address, mantissa("0.85"), 1);
  await rm.connect(admin).supportMarket(ffur.address, mantissa("0.6"), 2);
  // Set veFUR for Risk Manager
  await rm.connect(admin).setVeToken(veFur.address);
  // Admin supplies FUR
  await ffur.connect(admin).supply(mantissa("1000"));

  return { checker, spo, rm, nirm, feth, ffur };
}
