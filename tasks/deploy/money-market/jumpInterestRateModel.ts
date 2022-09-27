import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { deploy, getNetwork, writeDeployment } from "../../helpers";

task("deploy:JumpInterestRateModel", "Deploy jump interest rate model contract")
  .addParam("baserate", "Base rate per year")
  .addParam("multiplier", "Multiplier per year")
  .addParam("jumpmultiplier", "Jump multiplier per year")
  .addParam("kink", "Utilization rate where jump multiplier is used")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const baseRateMantissa = ethers.utils.parseUnits(taskArguments.baserate, 18);
    const multiplierMantissa = ethers.utils.parseUnits(taskArguments.multiplier, 18);
    const jumpMultiplierMantissa = ethers.utils.parseUnits(taskArguments.jumpmultiplier, 18);
    const kinkMantissa = ethers.utils.parseUnits(taskArguments.kink, 18);

    const network = getNetwork();

    const args = [
      baseRateMantissa.toString(),
      multiplierMantissa.toString(),
      jumpMultiplierMantissa.toString(),
      kinkMantissa.toString(),
    ];
    const jirm = await deploy(ethers, "JumpInterestRateModel", args);

    console.log();
    console.log(`Jump interest rate model deployed to: ${jirm.address} on ${network}`);

    writeDeployment(network, "JumpInterestRateModel", jirm.address, args);
  });
