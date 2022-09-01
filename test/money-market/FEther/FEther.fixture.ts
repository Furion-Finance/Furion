import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers, upgrades } from "hardhat";

import type { FErc20 } from "../../../src/types/contracts/money-market/FErc20";
import type { FEther } from "../../../src/types/contracts/money-market/FEther";
import type { NormalInterestRateModel } from "../../../src/types/contracts/money-market/NormalInterestRateModel";
import type { RiskManager } from "../../../src/types/contracts/money-market/RiskManager";
import type { SimplePriceOracle } from "../../../src/types/contracts/money-market/SimplePriceOracle";
import type { FurionTokenTest } from "../../../src/types/contracts/test-only/FurionTokenTest";
import type { FErc20__factory } from "../../../src/types/factories/contracts/money-market/FErc20__factory";
import type { FEther__factory } from "../../../src/types/factories/contracts/money-market/FEther__factory";
import type { NormalInterestRateModel__factory } from "../../../src/types/factories/contracts/money-market/NormalInterestRateModel__factory";
import type { RiskManager__factory } from "../../../src/types/factories/contracts/money-market/RiskManager__factory";
import type { SimplePriceOracle__factory } from "../../../src/types/factories/contracts/money-market/SimplePriceOracle__factory";
import type { FurionTokenTest__factory } from "../../../src/types/factories/contracts/test-only/FurionTokenTest__factory";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export async function deployFEtherFixture(): Promise<{
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
  const furFactory = await ethers.getContractFactory("FurionTokenTest");
  const fur = <FurionTokenTest>await furFactory.connect(admin).deploy([admin.address, alice.address]);
  await fur.deployed();

  // Deploy price oracle
  const spoFactory: SimplePriceOracle__factory = await ethers.getContractFactory("SimplePriceOracle");
  const spo = <SimplePriceOracle>await spoFactory.connect(admin).deploy();
  await spo.deployed();

  // Deploy risk manager
  const rmFactory: RiskManager__factory = await ethers.getContractFactory("RiskManager");
  const rm = <RiskManager>await upgrades.deployProxy(rmFactory, [spo.address]);
  await rm.deployed();

  // Deploy interest rate model
  const nirmFactory: NormalInterestRateModel__factory = await ethers.getContractFactory("NormalInterestRateModel");
  const nirm = <NormalInterestRateModel>await nirmFactory.connect(admin).deploy(mantissa("0.03"), mantissa("0.2"));
  await nirm.deployed();

  // Deploy fETH
  const fethFactory = await ethers.getContractFactory("FEther");
  const feth = <FEther>await upgrades.deployProxy(fethFactory, [rm.address, nirm.address, spo.address]);
  await feth.deployed();

  // Deploy fFUR
  const ffurFactory = await ethers.getContractFactory("FErc20");
  const ffur = <FErc20>(
    await upgrades.deployProxy(ffurFactory, [fur.address, rm.address, nirm.address, spo.address, "Furion FUR", "fFUR"])
  );
  await ffur.deployed();

  await fur.connect(admin).approve(ffur.address, mantissa("1000"));
  await fur.connect(alice).approve(ffur.address, mantissa("1000"));
  // Set close factor
  await rm.connect(admin).setCloseFactor(mantissa("0.5"));
  // Set fETH and fFUR market underlying price
  await spo.connect(admin).setUnderlyingPrice(feth.address, mantissa("1"));
  await spo.connect(admin).setUnderlyingPrice(ffur.address, mantissa("0.01"));
  // List fETH and fFUR market
  await rm.connect(admin).supportMarket(feth.address, mantissa("0.85"), 1);
  await rm.connect(admin).supportMarket(ffur.address, mantissa("0.6"), 2);
  // Admin supplies FUR
  await ffur.connect(admin).supply(mantissa("100"));

  return { spo, rm, nirm, feth, ffur };
}
