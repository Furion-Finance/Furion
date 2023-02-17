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

    for (let market of marketList[network]) {
      if (taskArguments.market == market.address) {
        const rm = await ethers.getContractAt("RiskManager", addressList[network].RiskManager);
        await rm.supportMarket(
          market.address,
          ethers.utils.parseUnits(taskArguments.collateralfactor, 18),
          taskArguments.tier,
        );

        market.tier = taskArguments.tier;
        storeMarketList(marketList);
        console.log(`${market.name} is now supported`);

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
