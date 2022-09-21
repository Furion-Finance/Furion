import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { clearFurionSwapList, readAddressList } from "../../../scripts/contractAddress";

task("deploy:TestFurionSwap", "Deploy all furion-swap contracts and trading pairs").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");

  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addressList = readAddressList();

  await hre.run("deploy:FurionSwapFactory");
  await hre.run("deploy:FurionSwapV2Router");

  clearFurionSwapList();

  await hre.run("createPair", {
    token0: addressList[_network].FurionToken,
    token1: addressList[_network].WETH,
    name0: "FUR",
    name1: "ETH",
  });

  await hre.run("createPair", {
    token0: addressList[_network].FurionToken,
    token1: addressList[_network].MockUSD,
    name0: "FUR",
    name1: "USDT",
  });

  await hre.run("createPair", {
    token0: addressList[_network].MockUSD,
    token1: addressList[_network].WETH,
    name0: "USDT",
    name1: "ETH",
  });

  console.log("Successfully deploy all furion-swap contracts, and create three trading pairs");
});
