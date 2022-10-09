import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers, upgrades } from "hardhat";

import type { Checker } from "../../../typechain/contracts/Checker";
import type { veFUR } from "../../../typechain/contracts/furion-staking/VoteEscrowedFurion";
import type { FEther } from "../../../typechain/contracts/money-market/FEther";
import type { NormalInterestRateModel } from "../../../typechain/contracts/money-market/NormalInterestRateModel";
import type { RiskManager } from "../../../typechain/contracts/money-market/RiskManager";
import type { SimplePriceOracle } from "../../../typechain/contracts/money-market/SimplePriceOracle";
import type { FurionToken } from "../../../typechain/contracts/tokens/FurionToken";
import type { Checker__factory } from "../../../typechain/factories/contracts/Checker__factory";
import type { veFUR__factory } from "../../../typechain/factories/contracts/furion-staking/VoteEscrowedFurion__factory";
import type { FEther__factory } from "../../../typechain/factories/contracts/money-market/FEther__factory";
import type { NormalInterestRateModel__factory } from "../../../typechain/factories/contracts/money-market/NormalInterestRateModel__factory";
import type { RiskManager__factory } from "../../../typechain/factories/contracts/money-market/RiskManager__factory";
import type { SimplePriceOracle__factory } from "../../../typechain/factories/contracts/money-market/SimplePriceOracle__factory";
import type { FurionToken__factory } from "../../../typechain/factories/contracts/tokens/FurionToken__factory";

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

  // Deploy FUR & veFUR -> set veFUR for Risk Manager
  const furFactory: FurionTokenTest__factory = await ethers.getContractFactory("FurionToken");
  const fur = <FurionToken>await furFactory.connect(admin).deploy();
  await fur.deployed();
  const veFurFactory: veFUR__factory = await ethers.getContractFactory("VoteEscrowedFurion");
  const veFur = <VoteEscrowedFurion>await upgrades.deployProxy(veFurFactory, [fur.address]);
  await veFur.deployed();
  await rm.setVeToken(veFur.address);

  // Deploy interest rate model
  const nirmFactory: NormalInterestRateModel__factory = await ethers.getContractFactory("NormalInterestRateModel");
  const nirm = <NormalInterestRateModel>await nirmFactory.connect(admin).deploy(mantissa("0.03"), mantissa("0.2"));
  await nirm.deployed();

  // Deploy checker
  const checkerFactory: Checker__factory = await ethers.getContractFactory("Checker");
  const checker = <Checker>await checkerFactory.connect(admin).deploy();
  await checker.deployed();

  // Deploy FEther
  const fethFactory = await ethers.getContractFactory("FEther");
  const feth = <FEther>(
    await upgrades.deployProxy(fethFactory, [rm.address, nirm.address, spo.address, checker.address])
  );
  await feth.deployed();

  // Set fETH market underlying price
  await spo.connect(admin).setUnderlyingPrice(feth.address, mantissa("1700"), mantissa("1"));

  return { spo, rm, nirm, feth };
}
