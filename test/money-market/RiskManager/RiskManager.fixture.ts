import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers, upgrades } from "hardhat";

import type { FEther } from "../../../src/types/contracts/money-market/FEther";
import type { NormalInterestRateModel } from "../../../src/types/contracts/money-market/NormalInterestRateModel";
import type { RiskManager } from "../../../src/types/contracts/money-market/RiskManager";
import type { SimplePriceOracle } from "../../../src/types/contracts/money-market/SimplePriceOracle";
import type { FEther__factory } from "../../../src/types/factories/contracts/money-market/FEther__factory";
import type { NormalInterestRateModel__factory } from "../../../src/types/factories/contracts/money-market/NormalInterestRateModel__factory";
import type { RiskManager__factory } from "../../../src/types/factories/contracts/money-market/RiskManager__factory";
import type { SimplePriceOracle__factory } from "../../../src/types/factories/contracts/money-market/SimplePriceOracle__factory";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export async function deployRiskManagerFixture(): Promise<{
  spo: SimplePriceOracle;
  rm: RiskManager;
  nirm: NormalInterestRateModel;
  feth: FEther;
}> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];

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

  // Deploy FEther
  const fethFactory = await ethers.getContractFactory("FEther");
  const feth = <FEther>await upgrades.deployProxy(fethFactory, [rm.address, nirm.address, spo.address]);
  await feth.deployed();

  // Set fETH market underlying price
  await spo.connect(admin).setUnderlyingPrice(feth.address, mantissa("1"));

  return { spo, rm, nirm, feth };
}
