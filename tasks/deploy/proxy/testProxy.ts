import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("deploy:TestProxy", "Deploy proxy admin").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const hre = require("hardhat");

  await hre.run("deploy:ProxyAdmin");

  console.log("Successfully deploy proxy admin");
});
