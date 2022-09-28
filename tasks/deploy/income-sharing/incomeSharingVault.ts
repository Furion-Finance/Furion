import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../../scripts/contractAddress";
import { deployUpgradeable, getNetwork, writeUpgradeableDeployment } from "../../helpers";

task("deploy:IncomeSharingVault", "Deploy Income Sharing Vault contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers, upgrades },
) {
  const hre = require("hardhat");
  const network = getNetwork();
  const addressList = readAddressList();

  const args = [addressList[network].VoteEscrowedFurion];
  const isv = await deployUpgradeable(ethers, upgrades, "IncomeSharingVault", args);

  console.log();
  console.log(`Income Sharing Vault deployed to: ${isv.address} on ${network}`);

  const implementation = await upgrades.erc1967.getImplementationAddress(isv.address);
  writeUpgradeableDeployment(network, "IncomeSharingVault", isv.address, implementation);
});
