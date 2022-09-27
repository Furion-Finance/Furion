import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../../scripts/contractAddress";
import { deploy, getNetwork, writeDeployment } from "../../helpers";

task("deploy:FurionSwapV2Router", "Deploy FurionSwapV2Router contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const network = getNetwork();
  const addressList = readAddressList();

  const args = [addressList[network].FurionSwapFactory, addressList[network].WETH];
  const furionSwapV2Router = await deploy(ethers, "FurionSwapV2Router", args);

  console.log();
  console.log(`FurionSwapV2Router deployed to: ${furionSwapV2Router.address} on ${network}`);

  writeDeployment(network, "FurionSwapV2Router", furionSwapV2Router.address, args);
});
