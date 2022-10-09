import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

import { deploy, deployUpgradeable } from "../../utils";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

// Initial NFT balances: (id)
// bob: four NFT (0, 1, 2, 3)
// alice: two NFT (4, 5)

export async function deployFErcFixture(): Promise<{
  checker: Checker;
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
  const nft = await deploy("NFTest", [
    [bob.address, bob.address, bob.address, bob.address, alice.address, alice.address],
  ]);

  // Deploy FUR
  const fur = await deploy("FurionTokenTest", [[admin.address, bob.address, alice.address]]);

  // Deploy veFUR
  const veFur = await deployUpgradeable("VoteEscrowedFurion", [fur.address]);

  // Deploy checker
  const checker = await deploy("Checker", []);

  // Deploy separate pool factory
  const spf = await deploy("SeparatePoolFactory", [admin.address, checker.address, fur.address]);

  // Set factory
  await checker.connect(admin).setSPFactory(spf.address);

  // Create separate pool (F-NFT token)
  const poolAddress = await spf.callStatic.createPool(nft.address);
  await spf.connect(admin).createPool(nft.address);
  const sp = <SeparatePool>await ethers.getContractAt("SeparatePool", poolAddress);

  // Deploy price oracle
  const spo = await deploy("SimplePriceOracle", []);

  // Deploy risk manager
  const rm = await deployUpgradeable("RiskManager", [spo.address]);

  // Deploy interest rate model
  const nirm = await deploy("NormalInterestRateModel", [mantissa("0.03"), mantissa("0.2")]);

  // Deploy FEther
  const feth = await deployUpgradeable("FEther", [rm.address, nirm.address, spo.address, checker.address]);

  // Deploy FErc20 (fF-NFT market)
  const ferc = await deployUpgradeable("FErc20", [
    sp.address,
    rm.address,
    nirm.address,
    spo.address,
    checker.address,
    "Furion F-NFT",
    "fF-NFT",
  ]);

  // Sell NFT to get F-NFT
  await nft.connect(bob).setApprovalForAll(sp.address, true);
  await nft.connect(alice).setApprovalForAll(sp.address, true);
  await sp.connect(bob).sellBatch([0, 1, 2, 3]);
  await sp.connect(alice).sellBatch([4, 5]);

  // Approve F-NFT spending
  await sp.connect(bob).approve(ferc.address, mantissa("10000"));
  await sp.connect(bob).approve(feth.address, mantissa("10000"));
  await sp.connect(alice).approve(ferc.address, mantissa("10000"));
  await sp.connect(alice).approve(feth.address, mantissa("10000"));

  // Set close factor
  await rm.connect(admin).setCloseFactor(mantissa("0.5"));
  // Set veFUR for Risk Manager
  await rm.connect(admin).setVeToken(veFur.address);

  // Set fETH market underlying price
  await spo.connect(admin).setUnderlyingPrice(feth.address, mantissa("1700"), mantissa("1"));
  // Set fF-NFT market underlying price (1000 F-NFT = 10 ETH)
  await spo.connect(admin).setUnderlyingPrice(ferc.address, mantissa("17"), mantissa("1"));

  // List fETH market
  await rm.connect(admin).supportMarket(feth.address, mantissa("0.85"), 1);
  // List fF-NFT market (cross-tier)
  await rm.connect(admin).supportMarket(ferc.address, mantissa("0.6"), 2);

  return { checker, sp, spo, rm, nirm, feth, ferc };
}
