import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, readMarketList, storeMarketList } from "../../scripts/contractAddress";

task("RM:SupportMarket", "Support given market")
  .addParam("market", "Address of market to support")
  .addParam("collateralfactor", "Collateral factor (0-0.9)")
  .addParam("tier", "Tier of market")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const hre = require("hardhat");
    const { network } = hre;
    const _network = network.name == "hardhat" ? "localhost" : network.name;

    const addressList = readAddressList();
    const marketList = readMarketList();

    for (let i = 0; i < marketList[_network].counter; i++) {
      if (taskArguments.market.localeCompare(marketList[_network][i].address)) {
        const rm = await ethers.getContractAt("RiskManager", addressList[_network].RiskManager);
        await rm.supportMarket(
          marketList[_network][i].address,
          ethers.utils.parseUnits(taskArguments.collateralfactor, 18),
          taskArguments.tier,
        );

        marketList[_network][i].tier = taskArguments.tier;
        storeMarketList(marketList);
        console.log(`${marketList[_network][i].symbol} is now supported`);

        return;
      }
    }

    console.log("Market not found");
  });
