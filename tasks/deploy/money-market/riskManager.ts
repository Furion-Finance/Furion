import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../../scripts/contractAddress";
import { deployUpgradeable, getNetwork, writeUpgradeableDeployment } from "../../helpers";

task("deploy:RiskManager", "Deploy risk manager contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers, upgrades },
) {
  const network = getNetwork();
  const addressList = readAddressList();

  const args = [addressList[network].PriceOracle];
  const rm = await deployUpgradeable(ethers, upgrades, "RiskManager", args);

  console.log();
  console.log(`Risk manager deployed to: ${rm.address} on ${network}`);

  const implementation = await upgrades.erc1967.getImplementationAddress(rm.address);
  writeUpgradeableDeployment(network, "RiskManager", rm.address, implementation);
});
