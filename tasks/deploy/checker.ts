import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { deploy } from "../helpers";

task("deploy:Checker", "Deploy checker contract").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const checker = await deploy(ethers, "Checker", null);

  console.log("Checker deployed to: ", checker.address);
});
