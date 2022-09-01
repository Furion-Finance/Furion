import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { deployUpgradeable } from "../../helpers";

task("deploy:RiskManager", "Deploy risk manager contract")
  .addParam("priceoracle", "Price oracle address")
  .setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
    const rm = await deployUpgradeable(ethers, upgrades, "RiskManager", [taskArguments.priceoracle]);

    console.log("Risk manager deployed to: ", rm.address);
  });
