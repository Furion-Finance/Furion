import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { AggregatePool, FurionPricingOracle, FurionTokenTest, NFTest, NFTest1 } from "../../../../typechain";
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

export async function deployAPFixture(): Promise<{
  nft: NFTest;
  nft1: NFTest1;
  fur: FurionTokenTest;
  ap: FractionalAggregatePool;
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

  // Set initial NFT & NFT1 prices (2 ETH & 1.5 ETH)
  await fpo.connect(admin).initPrice(nft.address, 1);
  await fpo.connect(admin).updatePrice(nft.address, 0, su("2"));
  await fpo.connect(admin).initPrice(nft1.address, 1);
  await fpo.connect(admin).updatePrice(nft1.address, 0, su("1.5"));

  // Deploy factories
  const apf = await deploy("AggregatePoolFactory", [admin.address, checker.address, fur.address, fpo.address]);

  // Set factory
  await checker.connect(admin).setAPFactory(apf.address);

  // Create aggregate pool, token is FFT-ANML
  const apAddress = await apf.callStatic.createPool([nft.address, nft1.address], "ANIMAL", "ANML");
  await apf.createPool([nft.address, nft1.address], "ANIMAL", "ANML");
  const ap = <AggregatePool>await ethers.getContractAt("AggregatePool", apAddress);

  // Approve spending of FUR by aggregate pool
  await fur.connect(admin).approve(ap.address, su("1000"));
  await fur.connect(bob).approve(ap.address, su("1000"));
  await fur.connect(alice).approve(ap.address, su("1000"));

  // Approve spending of NFTs by aggregate pool
  await nft.connect(admin).setApprovalForAll(ap.address, true);
  await nft.connect(bob).setApprovalForAll(ap.address, true);
  await nft.connect(alice).setApprovalForAll(ap.address, true);
  await nft1.connect(admin).setApprovalForAll(ap.address, true);
  await nft1.connect(bob).setApprovalForAll(ap.address, true);
  await nft1.connect(alice).setApprovalForAll(ap.address, true);

  return { nft, nft1, fur, ap, fpo };
}
