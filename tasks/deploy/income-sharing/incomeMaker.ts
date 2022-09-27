import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../../scripts/contractAddress";
import { deployUpgradeable, getNetwork, writeUpgradeableDeployment } from "../../helpers";

task("deploy:IncomeMaker", "Deploy Income Maker contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers, upgrades },
) {
  const hre = require("hardhat");
  const network = getNetwork();
  const addressList = readAddressList();

  const args = [
    addressList[network].FurionToken,
    addressList[network].FurionSwapV2Router,
    addressList[network].FurionSwapFactory,
    addressList[network].IncomeSharingVault,
  ];
  const im = await deployUpgradeable(ethers, upgrades, "IncomeMaker", args);

  console.log();
  console.log(`Income Maker deployed to: ${im.address} on ${network}`);

  writeUpgradeableDeployment(network, "IncomeMaker", im.address, args);

  await hre.run("Swap:SetIncomeMaker", { incomemaker: addressList[network].IncomeMaker });
});
