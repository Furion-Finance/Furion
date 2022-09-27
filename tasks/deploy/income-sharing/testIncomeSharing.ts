import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("deploy:TestIncomeSharing", "Deploy Income Sharing contracts").setAction(async function () {
  const hre = require("hardhat");
  await hre.run("deploy:IncomeSharingVault");
  await hre.run("deploy:IncomeMaker");

  console.log("Successfully deployed all income-sharing contracts");
  console.log("Task TestIncomeSharing ended successfully");
});
