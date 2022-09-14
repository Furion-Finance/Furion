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

task("deploy:FEther", "Deploy FEther contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers, upgrades },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;

  const feth = await deployUpgradeable(ethers, upgrades, "FEther", [
    addressList[_network].RiskManager,
    addressList[_network].NormalInterestRateModel,
    addressList[_network].PriceOracle,
    addressList[_network].Checker,
  ]);

  console.log(`FEther deployed to: ${feth.address}`);

  const market = {
    name: "FEther",
    address: feth.address,
  };

  marketList[_network][market_counter] = market;
  incMarketCounter();
  storeMarketList(marketList);
});
