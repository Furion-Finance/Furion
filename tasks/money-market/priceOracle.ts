import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, readMarketList } from "../../scripts/contractAddress";

task("PO:SetUnderlyingPrice", "Set price of underlying asset of a market")
  .addParam("market", "Address of market to interact with")
  .addParam("price", "Price of underlying asset")
  .addParam("decimals", "Decimals of underlying asset")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const hre = require("hardhat");
    const { network } = hre;
    const _network = network.name == "hardhat" ? "localhost" : network.name;

    const addressList = readAddressList();
    const marketList = readMarketList();

    for (let i = 0; i < marketList[_network].counter; i++) {
      if (taskArguments.market.localeCompare(marketList[_network][i].address)) {
        const po = await ethers.getContractAt("SimplePriceOracle", addressList[_network].PriceOracle);
        await po.setUnderlyingPrice(
          marketList[_network][i].address,
          ethers.utils.parseUnits(taskArguments.price, 18),
          ethers.utils.parseUnits("1", taskArguments.decimals),
        );

        console.log(`Price of ${marketList[_network][i].symbol.substring(1)} set`);

        return;
      }
    }

    console.log("Market not found");
  });
