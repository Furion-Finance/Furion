import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy, getNetwork, writeDeployment } from "../../helpers";

task("deploy:FurionSwapFactory", "Deploy FurionSwapFactory contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const network = getNetwork();
  const addressList = readAddressList();

  const args = ["0x0000000000000000000000000000000000000000"];
  const furionSwapFactory = await deploy(ethers, "FurionSwapFactory", args);

  console.log();
  console.log(`FurionSwapFactory deployed to: ${furionSwapFactory.address} on ${network}`);

  writeDeployment(network, "FurionSwapFactory", furionSwapFactory.address, args);
});
