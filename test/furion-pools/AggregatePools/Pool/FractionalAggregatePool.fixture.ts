import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type {
  FractionalAggregatePool,
  FurionPricingOracle,
  FurionTokenTest,
  SeparatePool,
} from "../../../../typechain";
import { deploy } from "../../../utils";

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

export async function deployFAPFixture(): Promise<{
  fur: FurionTokenTest;
  sp: SeparatePool;
  sp1: SeparatePool;
  fap: AggregatePool;
  fpo: FurionPricingOracle;
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

  // Deploy Furion Pricing Oracle
  const fpo = await deploy("FurionPricingOracle", []);

  // Set initial NFT price (2 ETH)
  await fpo.connect(admin).initPrice(nft.address, 1);
  await fpo.connect(admin).updatePrice(nft.address, 0, su("2"));

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

  // Bob sells NFT to project pools to get tokens (2000 F-NFT, 1000 F-NFT1)
  await nft.connect(bob).setApprovalForAll(sp.address, true);
  await sp.connect(bob).sellBatch([3, 4]);
  await nft1.connect(bob).setApprovalForAll(sp1.address, true);
  await sp1.connect(bob).sell(1);

  // Create aggregate pool for F-NFT, token is FFT-SING
  const fapAddress = await fapf.callStatic.createPool([sp.address], "Single", "SING");
  await fapf.createPool([sp.address], "Single", "SING");
  const fap = <FractionalAggregatePool>await ethers.getContractAt("FractionalAggregatePool", fapAddress);

  // Approve spending of F-NFT & FUR by agregate pool
  await sp.connect(bob).approve(fap.address, su("2000"));
  await fur.connect(bob).approve(fap.address, su("1000"));

  return { nft, fur, sp, sp1, fap, fpo };
}
