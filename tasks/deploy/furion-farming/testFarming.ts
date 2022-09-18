import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readFurionSwapList } from "../../../scripts/contractAddress";

task("deploy:TestFurionFarming", "Deploy all farming contracts and add farming pools").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");

  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const furionSwapList = readFurionSwapList();

  await hre.run("deploy:FurionFarming");

  const lpTokens = furionSwapList[_network];
  for (let index = 0; index < lpTokens.length; index++) {
    let lp = lpTokens[index].pair;
    await hre.run("addFarmingPool", {
      name: index + 1 + "",
      address: lp,
      reward: index + 1 + "",
    });
  }

  console.log("Successfully deploy all farming contracts, and create farming pools");
});
