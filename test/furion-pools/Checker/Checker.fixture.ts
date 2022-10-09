import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Checker } from "../../../src/types/contracts/Checker";
import type { AggregatePoolFactory } from "../../../src/types/contracts/aggregate-pool/AggregatePoolFactory";
import type { SeparatePoolFactory } from "../../../src/types/contracts/separate-pool/SeparatePoolFactory";
import type { FurionTokenTest } from "../../../src/types/contracts/test-only/FurionTokenTest";
import type { NFTest } from "../../../src/types/contracts/test-only/NFTest";
import type { Checker__factory } from "../../../src/types/factories/contracts/Checker__factory";
import type { AggregatePoolFactory__factory } from "../../../src/types/factories/contracts/aggregate-pool/AggregatePoolFactory__factory";
import type { SeparatePoolFactory__factory } from "../../../src/types/factories/contracts/separate-pool/SeparatePoolFactory__factory";
import type { FurionTokenTest__factory } from "../../../src/types/factories/contracts/test-only/FurionTokenTest__factory";
import type { NFTest__factory } from "../../../src/types/factories/contracts/test-only/NFTest__factory";

export async function deployCheckerFixture(): Promise<{
  nft: NFTest;
  furT: FurionTokenTest;
  checker: Checker;
  spf: SeparatePoolFactory;
  apf: AggregatePoolFactory;
}> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];
  const bob: SignerWithAddress = signers[1];
  const alice: SignerWithAddress = signers[2];

  const nftFactory: NFTest__factory = await ethers.getContractFactory("NFTest");
  const nft = <NFTest>await nftFactory.connect(admin).deploy([admin.address]);
  await nft.deployed();

  // Deploy FUR
  const furTFactory: FurionTokenTest__factory = await ethers.getContractFactory("FurionTokenTest");
  const furT = <FurionTokenTest>await furTFactory.connect(admin).deploy([admin.address, bob.address, alice.address]);
  await furT.deployed();

  // Deploy checker
  const checkerFactory: Checker__factory = await ethers.getContractFactory("Checker");
  const checker = <Checker>await checkerFactory.connect(admin).deploy();
  await checker.deployed();

  // Deploy separate pool factory
  const spfFactory: SeparatePoolFactory__factory = await ethers.getContractFactory("SeparatePoolFactory");
  const spf = <SeparatePoolFactory>await spfFactory.connect(admin).deploy(admin.address, checker.address, furT.address);
  await spf.deployed();

  // Deploy aggregate pool factory
  const apfFactory: AggregatePoolFactory__factory = await ethers.getContractFactory("AggregatePoolFactory");
  const apf = <AggregatePoolFactory>(
    await apfFactory
      .connect(admin)
      .deploy(admin.address, checker.address, furT.address, "0x0000000000000000000000000000000000000000", spf.address)
  );
  await apf.deployed();

  return { nft, furT, checker, spf, apf };
}
