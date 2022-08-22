import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { deployUpgradeable } from "../../helpers";

task("deploy:FEther", "Deploy FEther contract")
  .addParam("riskmanager", "Risk manager address")
  .addParam("interestratemodel", "Interest rate model address")
  .addParam("priceoracle", "Price oracle address")
  .addParam("checker", "Checker address")
  .setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
    const feth = await deployUpgradeable(ethers, upgrades, "FEther", [
      taskArguments.riskmanager,
      taskArguments.interestratemodel,
      taskArguments.priceoracle,
      taskArguments.checker,
    ]);

    console.log("FEther deployed to: ", feth.address);
  });
