import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { deployUpgradeable } from "../../helpers";

task("deploy:FErc20", "Deploy FErc20 contract")
  .addParam("underlying", "Address of underlying asset")
  .addParam("riskmanager", "Risk manager address")
  .addParam("interestratemodel", "Interest rate model address")
  .addParam("priceoracle", "Price oracle address")
  .addParam("checker", "Checker address")
  .addParam("name", "Name of market token")
  .addParam("symbol", "Symbol of market token")
  .setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
    const ferc = await deployUpgradeable(ethers, upgrades, "FErc20", [
      taskArguments.underlying,
      taskArguments.riskmanager,
      taskArguments.interestratemodel,
      taskArguments.priceoracle,
      taskArguments.checker,
      taskArguments.name,
      taskArguments.symbol,
    ]);

    console.log(`${taskArguments.symbol} deployed to: ${ferc.address}`);
  });
