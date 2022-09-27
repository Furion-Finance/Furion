import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

// TestProxy => TestFurionTokens => IncomeSharing => TestFurionPools => TestFurionSwap => TestFurionFarming
// => TestFurionMarket

task("deploy:TestVersion", "Deploy all testnet contracts").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");

  await hre.run("deploy:TestFurionTokens");
  await hre.run("deploy:TestFurionStaking");
  await hre.run("deploy:TestFurionFarming");
  await hre.run("deploy:TestFurionSwap");
  await hre.run("deploy:TestIncomeSharing");
  await hre.run("deploy:TestFurionPools");
  await hre.run("deploy:TestMarket");

  console.log("Successfully deployed all contracts for testnet");
});
