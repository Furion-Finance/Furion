import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("deploy:TestFurionPools", "Deploy all furion pools contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");

  await hre.run("deploy:Checker");
  await hre.run("deploy:SeparatePoolFactory");
  await hre.run("create:CoolSeparatePool");
  await hre.run("deploy:FurionPricingOracle");
  await hre.run("deploy:AggregatePoolFactory");
  await hre.run("create:CoolAggregatePool");
});
