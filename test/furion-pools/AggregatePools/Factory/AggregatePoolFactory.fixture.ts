import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Checker } from "../../../../src/types/contracts/Checker";
import type { AggregatePoolFactory } from "../../../../src/types/contracts/aggregate-pool/AggregatePoolFactory";
import type { SeparatePool } from "../../../../src/types/contracts/separate-pool/SeparatePool";
import type { SeparatePoolFactory } from "../../../../src/types/contracts/separate-pool/SeparatePoolFactory";
import type { FurionTokenTest } from "../../../../src/types/contracts/test-only/FurionTokenTest";
import type { NFTest } from "../../../../src/types/contracts/test-only/NFTest";
import type { NFTest1 } from "../../../../src/types/contracts/test-only/NFTest1";
import type { Checker__factory } from "../../../../src/types/factories/contracts/Checker__factory";
import type { AggregatePoolFactory__factory } from "../../../../src/types/factories/contracts/aggregate-pool/AggregatePoolFactory__factory";
import type { SeparatePoolFactory__factory } from "../../../../src/types/factories/contracts/separate-pool/SeparatePoolFactory__factory";
import type { SeparatePool__factory } from "../../../../src/types/factories/contracts/separate-pool/SeparatePool__factory";
import type { FurionTokenTest__factory } from "../../../../src/types/factories/contracts/test-only/FurionTokenTest__factory";
import type { NFTest1__factory } from "../../../../src/types/factories/contracts/test-only/NFTest1__factory";
import type { NFTest__factory } from "../../../../src/types/factories/contracts/test-only/NFTest__factory";

// Initial NFT balances: (id)
// admin: three NFT (0, 1, 2), one NFT1 (0)
// bob: two NFT (3, 4), one NFT1 (1)
// alice: one NFT (5), one NFT1 (2)

// Initial FUR balance:
// admin: 1000
// bob: 1000
// alice: 1000

export async function deployAPFFixture(): Promise<{
  apf: AggregatePoolFactory;
  sp: SeparatePool;
  sp1: SeparatePool;
}> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];
  const bob: SignerWithAddress = signers[1];
  const alice: SignerWithAddress = signers[2];

  const nftFactory = await ethers.getContractFactory("NFTest");
  const nft = <NFTest>(
    await nftFactory
      .connect(admin)
      .deploy([admin.address, admin.address, admin.address, bob.address, bob.address, alice.address])
  );
  await nft.deployed();

  const nft1Factory = await ethers.getContractFactory("NFTest1");
  const nft1 = <NFTest1>await nft1Factory.connect(admin).deploy([admin.address, bob.address, alice.address]);
  await nft1.deployed();

  // Deploy FUR
  const furTFactory = await ethers.getContractFactory("FurionTokenTest");
  const furT = <FurionTokenTest>await furTFactory.connect(admin).deploy([admin.address, bob.address, alice.address]);
  await furT.deployed();

  // Deploy checker
  const checkerFactory = await ethers.getContractFactory("Checker");
  const checker = <Checker>await checkerFactory.connect(admin).deploy();
  await checker.deployed();

  // Deploy factories
  const spfFactory = await ethers.getContractFactory("SeparatePoolFactory");
  const spf = <SeparatePoolFactory>await spfFactory.connect(admin).deploy(admin.address, checker.address, furT.address);
  await spf.deployed();

  const apfFactory = await ethers.getContractFactory("AggregatePoolFactory");
  const apf = <AggregatePoolFactory>(
    await apfFactory
      .connect(admin)
      .deploy(admin.address, checker.address, furT.address, "0x0000000000000000000000000000000000000000", spf.address)
  );
  await apf.deployed();

  // Set factory
  await checker.connect(admin).setSPFactory(spf.address);
  await checker.connect(admin).setAPFactory(apf.address);

  // Create project pools
  const spAddress = await spf.callStatic.createPool(nft.address);
  await spf.createPool(nft.address);
  const spAddress1 = await spf.callStatic.createPool(nft1.address);
  await spf.createPool(nft1.address);
  const sp = <SeparatePool>await ethers.getContractAt("SeparatePool", spAddress);
  const sp1 = <SeparatePool>await ethers.getContractAt("SeparatePool", spAddress1);

  return { apf, sp, sp1 };
}
