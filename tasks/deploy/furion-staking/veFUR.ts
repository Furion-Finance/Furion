import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../../scripts/contractAddress";
import { deployUpgradeable, getNetwork, writeUpgradeableDeployment } from "../../helpers";

task("deploy:veFUR", "Deploy veFUR contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers, upgrades },
) {
  const hre = require("hardhat");
  const network = getNetwork();
  const addressList = readAddressList();

  const veFUR = await deployUpgradeable(ethers, upgrades, "VoteEscrowedFurion", [addressList[network].FurionToken]);

  console.log(`VoteEscrowedFurion deployed to: ${veFUR.address} on ${network}`);

  const implementation = await upgrades.erc1967.getImplementationAddress(veFUR.address);
  writeUpgradeableDeployment(network, "VoteEscrowedFurion", veFUR.address, implementation);
});
