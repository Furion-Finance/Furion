import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { clearMarketList, readAddressList, readMarketList } from "../../../scripts/contractAddress";
import { getNetwork } from "../../helpers";

task("deploy:TestMarket", "Deploy all money market contracts").setAction(async function (
  taskArguments: TaskArguments,
  { ethers, upgrades },
) {
  const hre = require("hardhat");
  const network = getNetwork();

  clearMarketList();

  await hre.run("deploy:PriceOracle");
  await hre.run("deploy:RiskManager");
  await hre.run("deploy:NormalInterestRateModel", {
    baserate: "0.03",
    multiplier: "0.2",
  });
  await hre.run("deploy:JumpInterestRateModel", {
    baserate: "0",
    multiplier: "0.05",
    jumpmultiplier: "1.09",
    kink: "0.8",
  });
  const addressList = readAddressList();
  await hre.run("deploy:FEther");
  await hre.run("deploy:FErc20", {
    underlying: addressList[network].FurionToken,
    jump: "false",
    name: "Furion Furion Token",
    symbol: "fFUR",
  });
  await hre.run("deploy:FErc20", {
    underlying: addressList[network].MockUSD,
    jump: "true",
    name: "Furion USD",
    symbol: "fUSDC",
  });

  const marketList = readMarketList();
  // Set price oracle prices
  const po = await ethers.getContractAt("SimplePriceOracle", addressList[network].PriceOracle);
  await po.setUnderlyingPrice(marketList[network]["0"].address, ethers.utils.parseUnits("1700", 18), (1e18).toString());
  console.log("Price of ETH set");
  await po.setUnderlyingPrice(marketList[network]["1"].address, (5e18).toString(), (1e18).toString());
  console.log("Price of FUR set");
  await po.setUnderlyingPrice(marketList[network]["2"].address, (1e18).toString(), (1e6).toString());
  console.log("Price of USDC set");

  // Support markets
  const rm = await ethers.getContractAt("RiskManager", addressList[network].RiskManager);
  await rm.supportMarket(marketList[network]["0"].address, (0.6e18).toString(), 2);
  console.log("fETH supported");
  await rm.supportMarket(marketList[network]["1"].address, (0.4e18).toString(), 3);
  console.log("fFUR supported");
  await rm.supportMarket(marketList[network]["2"].address, (0.85e18).toString(), 1);
  console.log("fUSDC supported");
});
