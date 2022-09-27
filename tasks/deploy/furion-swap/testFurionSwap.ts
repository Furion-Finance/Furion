import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { clearFurionSwapList, readAddressList } from "../../../scripts/contractAddress";
import { getNetwork } from "../../helpers";

task("deploy:TestFurionSwap", "Deploy all furion-swap contracts and trading pairs").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");

  const network = getNetwork();
  const addressList = readAddressList();

  await hre.run("deploy:FurionSwapFactory");
  await hre.run("deploy:FurionSwapV2Router");

  clearFurionSwapList();

  await hre.run("create:SwapPair", {
    token0: addressList[network].FurionToken,
    token1: addressList[network].WETH,
    name0: "FUR",
    name1: "ETH",
  });

  await hre.run("create:SwapPair", {
    token0: addressList[network].FurionToken,
    token1: addressList[network].MockUSD,
    name0: "FUR",
    name1: "USDT",
  });

  await hre.run("create:SwapPair", {
    token0: addressList[network].MockUSD,
    token1: addressList[network].WETH,
    name0: "USDT",
    name1: "ETH",
  });

  console.log("Successfully deploy all furion-swap contracts, and create three trading pairs");
});
