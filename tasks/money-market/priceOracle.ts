import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, readMarketList } from "../../scripts/contractAddress";
import { getNetwork } from "../helpers";

task("PO:SetUnderlyingPrice", "Set price of underlying asset of a market")
  .addParam("market", "Address of market to interact with")
  .addParam("price", "Price of underlying asset")
  .addParam("decimals", "Decimals of underlying asset")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const network = getNetwork();

    const addressList = readAddressList();
    const marketList = readMarketList();

    for (let i = 0; i < marketList[network].counter; i++) {
      if (taskArguments.market.localeCompare(marketList[network][i].address)) {
        const po = await ethers.getContractAt("SimplePriceOracle", addressList[network].PriceOracle);
        await po.setUnderlyingPrice(
          marketList[network][i].address,
          ethers.utils.parseUnits(taskArguments.price, 18),
          ethers.utils.parseUnits("1", taskArguments.decimals),
        );

        console.log(`Price of ${marketList[network][i].symbol.substring(1)} set`);

        return;
      }
    }

    console.log("Market not found");
  });
