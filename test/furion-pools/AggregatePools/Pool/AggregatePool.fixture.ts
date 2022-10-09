import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Checker } from "../../../../typechain/contracts/Checker";
import type { AggregatePool } from "../../../../typechain/contracts/aggregate-pool/AggregatePool";
import type { AggregatePoolFactory } from "../../../../typechain/contracts/aggregate-pool/AggregatePoolFactory";
import type { FurionPricingOracle } from "../../../../typechain/contracts/aggregate-pool/FurionPricingOracle";
import type { SeparatePool } from "../../../../typechain/contracts/separate-pool/SeparatePool";
import type { SeparatePoolFactory } from "../../../../typechain/contracts/separate-pool/SeparatePoolFactory";
import type { FurionTokenTest } from "../../../../typechain/contracts/test-only/FurionTokenTest";
import type { NFTest } from "../../../../typechain/contracts/test-only/NFTest";
import type { NFTest1 } from "../../../../typechain/contracts/test-only/NFTest1";
import type { Checker__factory } from "../../../../typechain/factories/contracts/Checker__factory";
import type { AggregatePoolFactory__factory } from "../../../../typechain/factories/contracts/aggregate-pool/AggregatePoolFactory__factory";
import type { FurionPricingOracle__factory } from "../../../../typechain/factories/contracts/aggregate-pool/FurionPricingOracle__factory";
import type { SeparatePoolFactory__factory } from "../../../../typechain/factories/contracts/separate-pool/SeparatePoolFactory__factory";
import type { SeparatePool__factory } from "../../../../typechain/factories/contracts/separate-pool/SeparatePool__factory";
import type { FurionTokenTest__factory } from "../../../../typechain/factories/contracts/test-only/FurionTokenTest__factory";
import type { NFTest1__factory } from "../../../../typechain/factories/contracts/test-only/NFTest1__factory";
import type { NFTest__factory } from "../../../../typechain/factories/contracts/test-only/NFTest__factory";

// Initial NFT balances: (id)
// admin: three NFT (0, 1, 2), one NFT1 (0)
// bob: two NFT (3, 4), one NFT1 (1)
// alice: one NFT (5), one NFT1 (2)

// Initial FUR balance:
// admin: 1000
// bob: 1000
// alice: 1000

function su(amount: string): BigNumberish {
  return ethers.utils.parseEther(amount);
}

export async function deployAPFixture(): Promise<{
  nft: NFTest;
  furT: FurionTokenTest;
  sp: SeparatePool;
  sp1: SeparatePool;
  ap: AggregatePool;
  fpo: FurionPricingOracle;
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

  // Deploy Furion Pricing Oracle
  const fpoFactory = await ethers.getContractFactory("FurionPricingOracle");
  const fpo = <FurionPricingOracle>await fpoFactory.connect(admin).deploy();
  await fpo.deployed();

  // Set initial NFT price (15 ETH)
  await fpo.connect(admin).initPrice(nft.address, 1);
  await fpo.connect(admin).updatePrice(nft.address, 0, su("15"));

  // Deploy factories
  const spfFactory = await ethers.getContractFactory("SeparatePoolFactory");
  const spf = <SeparatePoolFactory>await spfFactory.connect(admin).deploy(admin.address, checker.address, furT.address);
  await spf.deployed();

  const apfFactory = await ethers.getContractFactory("AggregatePoolFactory");
  const apf = <AggregatePoolFactory>(
    await apfFactory.connect(admin).deploy(admin.address, checker.address, furT.address, fpo.address, spf.address)
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

  // Bob sells NFT to project pools to get tokens (2000 F-NFT, 1000 F-NFT1)
  await nft.connect(bob).setApprovalForAll(sp.address, true);
  await sp.connect(bob).sellBatch([3, 4]);
  await nft1.connect(bob).setApprovalForAll(sp1.address, true);
  await sp1.connect(bob).sell(1);

  // Create aggregate pool for F-NFT, token is FFT-SING
  const apAddress = await apf.callStatic.createPool([sp.address], "Single", "SING");
  await apf.createPool([sp.address], "Single", "SING");
  const ap = <AggregatePool>await ethers.getContractAt("AggregatePool", apAddress);

  // Approve spending of F-NFT & FUR by agregate pool
  await sp.connect(bob).approve(ap.address, su("2000"));
  await furT.connect(bob).approve(ap.address, su("1000"));

  return { nft, furT, sp, sp1, ap, fpo };
}
