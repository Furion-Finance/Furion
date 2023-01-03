import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { AggregatePoolFactory, Checker, FurionTokenTest, NFTest, SeparatePoolFactory } from "../../../typechain";
import { deploy } from "../../utils";

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

  const nft = await deploy("NFTest", [[admin.address]]);

  // Deploy FUR
  const fur = await deploy("FurionTokenTest", [[admin.address, bob.address, alice.address]]);

  // Deploy checker
  const checker = await deploy("Checker", []);

  // Deploy separate pool factory
  const spf = await deploy("SeparatePoolFactory", [admin.address, checker.address, fur.address]);

  // Deploy aggregate pool factory
  const apf = await deploy("AggregatePoolFactory", [
    admin.address,
    checker.address,
    fur.address,
    "0x0000000000000000000000000000000000000000",
  ]);

  return { nft, fur, checker, spf, apf };
}
