import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../../scripts/contractAddress";
import { deployUpgradeable, getNetwork, writeMarketDeployment } from "../../helpers";

task("deploy:FErc20", "Deploy FErc20 contract")
  .addParam("underlying", "Address of underlying asset")
  .addParam("jump", "Whether jump interest rate model is used, true/false")
  .addParam("name", "Name of market token")
  .addParam("symbol", "Symbol of market token")
  .setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
    const network = getNetwork();
    const addressList = readAddressList();

    let args;
    if (taskArguments.jump == "true") {
      args = [
        taskArguments.underlying,
        addressList[network].RiskManager,
        addressList[network].JumpInterestRateModel,
        addressList[network].PriceOracle,
        addressList[network].Checker,
        taskArguments.name,
        taskArguments.symbol,
      ];
    } else {
      args = [
        taskArguments.underlying,
        addressList[network].RiskManager,
        addressList[network].NormalInterestRateModel,
        addressList[network].PriceOracle,
        addressList[network].Checker,
        taskArguments.name,
        taskArguments.symbol,
      ];
    }

    const ferc = await deployUpgradeable(ethers, upgrades, "FErc20", args);

    console.log();
    console.log(`${taskArguments.symbol} deployed to: ${ferc.address} on ${network}`);

    const implementation = await upgrades.erc1967.getImplementationAddress(ferc.address);
    writeMarketDeployment(network, taskArguments.symbol, ferc.address, implementation);
  });
