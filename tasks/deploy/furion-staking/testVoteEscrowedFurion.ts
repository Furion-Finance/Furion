import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("deploy:TestFurionStaking", "Deploy Furion Staking contracts").setAction(async function () {
  const hre = require("hardhat");
  await hre.run("deploy:veFUR");

  console.log("Successfully deploy all furion-staking contracts");
});
