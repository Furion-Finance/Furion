import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { deploy } from "../../helpers";

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

    const jirm = await deploy(
      ethers,
      "JumpInterestRateModel",
      baseRateMantissa,
      multiplierMantissa,
      jumpMultiplierMantissa,
      kinkMantissa,
    );

    console.log("Jump interest rate model deployed to: ", jirm.address);
  });
