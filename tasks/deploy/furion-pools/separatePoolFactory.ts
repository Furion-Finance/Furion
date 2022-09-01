import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { deploy } from "../../helpers";

task("deploy:SeparatePoolFactory", "Deploy seaparate pool factory contract")
  .addParam("incomemaker", "Income maker address")
  .addParam("checker", "Checker address")
  .addParam("fur", "FUR address")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const spf = await deploy(ethers, "SeparatePoolFactory", [
      taskArguments.incomemaker,
      taskArguments.checker,
      taskArguments.fur,
    ]);

    console.log("Separate pool factory deployed to: ", spf.address);
  });
