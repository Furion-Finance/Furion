import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

import type { Checker } from "../../../src/types/contracts/Checker";
import type { FErc20 } from "../../../src/types/contracts/money-market/FErc20";
import type { FEther } from "../../../src/types/contracts/money-market/FEther";
import type { NormalInterestRateModel } from "../../../src/types/contracts/money-market/NormalInterestRateModel";
import type { RiskManager } from "../../../src/types/contracts/money-market/RiskManager";
import type { SimplePriceOracle } from "../../../src/types/contracts/money-market/SimplePriceOracle";
import type { SeparatePool } from "../../../src/types/contracts/separate-pool/SeparatePool";
import type { SeparatePoolFactory } from "../../../src/types/contracts/separate-pool/SeparatePoolFactory";
import type { FurionTokenTest } from "../../../src/types/contracts/test-only/FurionTokenTest";
import type { NFTest } from "../../../src/types/contracts/test-only/NFTest";
import type { Checker__factory } from "../../../src/types/factories/contracts/Checker__factory";
import type { FErc20__factory } from "../../../src/types/factories/contracts/money-market/FErc20__factory";
import type { FEther__factory } from "../../../src/types/factories/contracts/money-market/FEther__factory";
import type { NormalInterestRateModel__factory } from "../../../src/types/factories/contracts/money-market/NormalInterestRateModel__factory";
import type { RiskManager__factory } from "../../../src/types/factories/contracts/money-market/RiskManager__factory";
import type { SimplePriceOracle__factory } from "../../../src/types/factories/contracts/money-market/SimplePriceOracle__factory";
import type { SeparatePoolFactory__factory } from "../../../src/types/factories/contracts/separate-pool/SeparatePoolFactory__factory";
import type { FurionTokenTest__factory } from "../../../src/types/factories/contracts/test-only/FurionTokenTest__factory";
import type { NFTest__factory } from "../../../src/types/factories/contracts/test-only/NFTest__factory";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

// Initial NFT balances: (id)
// bob: four NFT (0, 1, 2, 3)
// alice: two NFT (4, 5)

export async function deployFErcFixture(): Promise<{
  sp: SeparatePool;
  spo: SimplePriceOracle;
  rm: RiskManager;
  nirm: NormalInterestRateModel;
  feth: FEther;
  ferc: FErc20;
}> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];
  const bob: SignerWithAddress = signers[1];
  const alice: SignerWithAddress = signers[2];

  // Deploy dummy NFT
  const nftFactory = await ethers.getContractFactory("NFTest");
  const nft = <NFTest>(
    await nftFactory
      .connect(admin)
      .deploy([bob.address, bob.address, bob.address, bob.address, alice.address, alice.address])
  );
  await nft.deployed();

  // Deploy FUR
  const furTFactory = await ethers.getContractFactory("FurionTokenTest");
  const furT = <FurionTokenTest>await furTFactory.connect(admin).deploy([admin.address, bob.address, alice.address]);
  await furT.deployed();

  // Deploy checker
  const checkerFactory = await ethers.getContractFactory("Checker");
  const checker = <Checker>await checkerFactory.connect(admin).deploy();
  await checker.deployed();

  // Deploy separate pool factory
  const spfFactory = await ethers.getContractFactory("SeparatePoolFactory");
  const spf = <SeparatePoolFactory>await spfFactory.connect(admin).deploy(checker.address, furT.address);
  await spf.deployed();

  // Set factory
  await checker.connect(admin).setSPFactory(spf.address);

  // Create separate pool (F-NFT token)
  const poolAddress = await spf.callStatic.createPool(nft.address);
  await spf.connect(admin).createPool(nft.address);
  const sp = <SeparatePool>await ethers.getContractAt("SeparatePool", poolAddress);

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

  // Deploy FErc20 (fF-NFT market)
  const fercFactory = await ethers.getContractFactory("FErc20");
  const ferc = <FErc20>(
    await upgrades.deployProxy(fercFactory, [
      sp.address,
      rm.address,
      nirm.address,
      spo.address,
      "Furion F-NFT",
      "fF-NFT",
    ])
  );
  await ferc.deployed();

  // Sell NFT to get F-NFT
  await nft.connect(bob).approve(sp.address, 0);
  await nft.connect(bob).approve(sp.address, 1);
  await nft.connect(bob).approve(sp.address, 2);
  await nft.connect(bob).approve(sp.address, 3);
  await nft.connect(alice).approve(sp.address, 4);
  await nft.connect(alice).approve(sp.address, 5);
  await sp.connect(bob)["sell(uint256[])"]([0, 1, 2, 3]);
  expect(await sp.balanceOf(bob.address)).to.equal(mantissa("4000"));
  await sp.connect(alice)["sell(uint256[])"]([4, 5]);
  expect(await sp.balanceOf(alice.address)).to.equal(mantissa("2000"));

  // Approve F-NFT spending
  await sp.connect(bob).approve(ferc.address, mantissa("10000"));
  await sp.connect(bob).approve(feth.address, mantissa("10000"));
  await sp.connect(alice).approve(ferc.address, mantissa("10000"));
  await sp.connect(alice).approve(feth.address, mantissa("10000"));

  // Set close factor
  await rm.connect(admin).setCloseFactor(mantissa("0.5"));

  // Set fETH market underlying price
  await spo.connect(admin).setUnderlyingPrice(feth.address, mantissa("1"));
  // Set fF-NFT market underlying price (1 fF-NFT = 0.01 ETH)
  await spo.connect(admin).setUnderlyingPrice(ferc.address, mantissa("0.01"));

  // List fETH market
  await rm.connect(admin).supportMarket(feth.address, mantissa("0.85"), 1);
  // List fF-NFT market (cross-tier)
  await rm.connect(admin).supportMarket(ferc.address, mantissa("0.4"), 2);

  return { sp, spo, rm, nirm, feth, ferc };
}
