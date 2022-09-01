import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Checker } from "../../../../src/types/contracts/Checker";
import type { AggregatePool } from "../../../../src/types/contracts/aggregate-pool/AggregatePool";
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

export async function deployAPFixture(): Promise<{
  nft: NFTest;
  nft1: NFTest1;
  furT: FurionTokenTest;
  checker: Checker;
  spf: SeparatePoolFactory;
  apf: AggregatePoolFactory;
  sp: SeparatePool;
  sp1: SeparatePool;
  ap: AggregatePool;
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

  const spfFactory = await ethers.getContractFactory("SeparatePoolFactory");
  const spf = <SeparatePoolFactory>await spfFactory.connect(admin).deploy(checker.address, furT.address);
  await spf.deployed();

  const apfFactory = await ethers.getContractFactory("AggregatePoolFactory");
  const apf = <AggregatePoolFactory>await apfFactory.connect(admin).deploy(checker.address, furT.address);
  await apf.deployed();

  // Set factory
  await checker.connect(admin).setSPFactory(spf.address);
  await checker.connect(admin).setAPFactory(apf.address);

  // Create project pools
  const SeparatePool = await spf.callStatic.createPool(nft.address);
  await spf.createPool(nft.address);
  const SeparatePool1 = await spf.callStatic.createPool(nft1.address);
  await spf.createPool(nft1.address);
  const sp = <SeparatePool>await ethers.getContractAt("SeparatePool", SeparatePool);
  const sp1 = <SeparatePool>await ethers.getContractAt("SeparatePool", SeparatePool1);

  // Bob sells NFT to project pools to get tokens (2000 F-NFT)
  await nft.connect(bob).approve(sp.address, 3);
  await nft.connect(bob).approve(sp.address, 4);
  await sp.connect(bob)["sell(uint256[])"]([3, 4]);
  await nft1.connect(bob).approve(sp1.address, 1);
  await sp1.connect(bob)["sell(uint256)"](1);

  // Create aggregate pool for F-NFT, token is FFT1
  const AggregatePool = await apf.callStatic.createPool([sp.address]);
  await apf.createPool([sp.address]);
  const ap = <AggregatePool>await ethers.getContractAt("AggregatePool", AggregatePool);

  return { nft, nft1, furT, checker, spf, apf, sp, sp1, ap };
}
