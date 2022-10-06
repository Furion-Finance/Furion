import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, readMarketList, storeMarketList } from "../../scripts/contractAddress";
import { getNetwork } from "../helpers";

task("RM:SupportMarket", "Support given market")
  .addParam("market", "Address of market to support")
  .addParam("collateralfactor", "Collateral factor (0-0.9)")
  .addParam("tier", "Tier of market")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const network = getNetwork();

    const addressList = readAddressList();
    const marketList = readMarketList();

    for (let i = 0; i < marketList[network].counter; i++) {
      if (taskArguments.market.localeCompare(marketList[network][i].address)) {
        const rm = await ethers.getContractAt("RiskManager", addressList[network].RiskManager);
        await rm.supportMarket(
          marketList[network][i].address,
          ethers.utils.parseUnits(taskArguments.collateralfactor, 18),
          taskArguments.tier,
        );

        marketList[network][i].tier = taskArguments.tier;
        storeMarketList(marketList);
        console.log(`${marketList[network][i].symbol} is now supported`);

        return;
      }
    }

    console.log("Market not found");
  });

task("RM:SetVeFUR", "Set veFUR for calculating collateral factor boost")
  //.addParam("vefur", "Address of veFUR")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const network = getNetwork();
    const addressList = readAddressList();

    const rm = await ethers.getContractAt("RiskManager", addressList[network].RiskManager);
    await rm.setVeToken(addressList[network].VoteEscrowedFurion);

    console.log("veFUR set");
  });
