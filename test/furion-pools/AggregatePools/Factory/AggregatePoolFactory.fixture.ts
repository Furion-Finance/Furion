import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import { AggregatePoolFactory } from "../../../../typechain";
import { deploy } from "../../../utils";

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

  const apf = await deploy("AggregatePoolFactory", [admin.address, checker.address, fur.address, fpo.address]);

  // Set factory
  await checker.connect(admin).setAPFactory(apf.address);

  return { nft, nft1, apf };
}
