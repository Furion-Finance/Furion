import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { deploy, getNetwork, writeDeployment } from "../../helpers";

task("deploy:NormalInterestRateModel", "Deploy normal interest rate model contract")
  .addParam("baserate", "Base rate per year")
  .addParam("multiplier", "Multiplier per year")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const baseRateMantissa = ethers.utils.parseUnits(taskArguments.baserate, 18);
    const multiplierMantissa = ethers.utils.parseUnits(taskArguments.multiplier, 18);

    const network = getNetwork();

    const args = [baseRateMantissa.toString(), multiplierMantissa.toString()];
    const nirm = await deploy(ethers, "NormalInterestRateModel", args);

    console.log();
    console.log(`Normal interest rate model deployed to: ${nirm.address} on ${network}`);

    writeDeployment(network, "NormalInterestRateModel", nirm.address, args);
  });
