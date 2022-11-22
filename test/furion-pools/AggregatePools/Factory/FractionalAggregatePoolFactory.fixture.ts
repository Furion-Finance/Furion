import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import { FractionalAggregatePool, SeparatePool } from "../../../../typechain";
import { deploy } from "../../../utils";

// Initial NFT balances: (id)
// admin: three NFT (0, 1, 2), one NFT1 (0)
// bob: two NFT (3, 4), one NFT1 (1)
// alice: one NFT (5), one NFT1 (2)

// Initial FUR balance:
// admin: 1000
// bob: 1000
// alice: 1000

export async function deployFAPFFixture(): Promise<{
  fapf: FractionalAggregatePoolFactory;
  sp: SeparatePool;
  sp1: SeparatePool;
}> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];
  const bob: SignerWithAddress = signers[1];
  const alice: SignerWithAddress = signers[2];

  const nft = await deploy("NFTest", [
    [admin.address, admin.address, admin.address, bob.address, bob.address, alice.address],
  ]);

  const nft1 = await deploy("NFTest1", [[admin.address, bob.address, alice.address]]);

  // Deploy FUR
  const fur = await deploy("FurionTokenTest", [[admin.address, bob.address, alice.address]]);

  // Deploy checker
  const checker = await deploy("Checker", []);

  // Deploy nft oracle
  const fpo = await deploy("FurionPricingOracle", []);

  // Deploy factories
  const spf = await deploy("SeparatePoolFactory", [admin.address, checker.address, fur.address]);

  const fapf = await deploy("FractionalAggregatePoolFactory", [
    admin.address,
    checker.address,
    fur.address,
    fpo.address,
    spf.address,
  ]);

  // Set factory
  await checker.connect(admin).setSPFactory(spf.address);
  await checker.connect(admin).setAPFactory(fapf.address);

  // Create project pools
  const spAddress = await spf.callStatic.createPool(nft.address);
  await spf.createPool(nft.address);
  const spAddress1 = await spf.callStatic.createPool(nft1.address);
  await spf.createPool(nft1.address);
  const sp = <SeparatePool>await ethers.getContractAt("SeparatePool", spAddress);
  const sp1 = <SeparatePool>await ethers.getContractAt("SeparatePool", spAddress1);

  return { fapf, sp, sp1 };
}
