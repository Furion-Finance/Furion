import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import {
  incMarketCounter,
  market_counter,
  readAddressList,
  readMarketList,
  storeMarketList,
} from "../../../scripts/contractAddress";
import { deployUpgradeable } from "../../helpers";

const addressList = readAddressList();
const marketList = readMarketList();

task("deploy:FErc20", "Deploy FErc20 contract")
  .addParam("underlying", "Address of underlying asset")
  .addParam("jump", "Whether jump interest rate model is used, true/false")
  .addParam("name", "Name of market token")
  .addParam("symbol", "Symbol of market token")
  .setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
    const hre = require("hardhat");
    const { network } = hre;
    const _network = network.name == "hardhat" ? "localhost" : network.name;

    let ferc;
    if (taskArguments.jump) {
      ferc = await deployUpgradeable(ethers, upgrades, "FErc20", [
        taskArguments.underlying,
        addressList[_network].RiskManager,
        addressList[_network].JumpInterestRateModel,
        addressList[_network].PriceOracle,
        addressList[_network].Checker,
        taskArguments.name,
        taskArguments.symbol,
      ]);
    } else {
      ferc = await deployUpgradeable(ethers, upgrades, "FErc20", [
        taskArguments.underlying,
        addressList[_network].RiskManager,
        addressList[_network].NormalInterestRateModel,
        addressList[_network].PriceOracle,
        addressList[_network].Checker,
        taskArguments.name,
        taskArguments.symbol,
      ]);
    }

    console.log(`${taskArguments.symbol} deployed to: ${ferc.address} on ${_network}`);

    const market = {
      name: taskArguments.symbol,
      address: ferc.address,
    };

    marketList[_network][market_counter] = market;
    incMarketCounter();
    storeMarketList(marketList);
  });
