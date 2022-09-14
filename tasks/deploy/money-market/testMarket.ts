import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import {
  clearMarketList,
  incMarketCounter,
  market_counter,
  readAddressList,
  readMarketList,
  storeAddressList,
  storeMarketList,
} from "../../../scripts/contractAddress";
import { deploy, deployUpgradeable } from "../../helpers";

const addressList = readAddressList();
const marketList = readMarketList();

task("deploy:TestMarket", "Deploy all money market contracts").setAction(async function (
  taskArguments: TaskArguments,
  { ethers, upgrades },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;

  clearMarketList();

  // Deploy Price Oracle
  const po = await deploy(ethers, "SimplePriceOracle", null);
  console.log(`Price oracle deployed to: ${po.address} on ${_network}`);
  addressList[_network].PriceOracle = po.address;

  // Deploy Risk Manager
  const rm = await deployUpgradeable(ethers, upgrades, "RiskManager", [po.address]);
  console.log(`Risk manager deployed to: ${rm.address} on ${_network}`);
  addressList[_network].RiskManager = rm.address;

  // Deploy Normal Interest Rate Model
  const nirm = await deploy(ethers, "NormalInterestRateModel", (3e16).toString(), (2e17).toString());
  console.log(`Normal interest rate model deployed to: ${nirm.address} on ${_network}`);
  addressList[_network].NormalInterestRateModel = nirm.address;

  // Deploy Jump Interest Rate Model
  const jirm = await deploy(
    ethers,
    "JumpInterestRateModel",
    0,
    (0.05e18).toString(),
    (1.09e18).toString(),
    (0.8e18).toString(),
  );
  console.log(`Jump interest rate model deployed to: ${jirm.address} on ${_network}`);
  addressList[_network].JumpInterestRateModel = jirm.address;
  storeAddressList(addressList);

  // Deploy FEther
  const feth = await deployUpgradeable(ethers, upgrades, "FEther", [
    addressList[_network].RiskManager,
    addressList[_network].NormalInterestRateModel,
    addressList[_network].PriceOracle,
    addressList[_network].Checker,
  ]);
  console.log(`fETH deployed to: ${feth.address} on ${_network}`);

  const feth_market = {
    name: "fETH",
    address: feth.address,
  };
  marketList[_network][market_counter] = feth_market;
  incMarketCounter();

  // Deploy fFUR
  const ffur = await deployUpgradeable(ethers, upgrades, "FErc20", [
    addressList[_network].FurionToken,
    addressList[_network].RiskManager,
    addressList[_network].NormalInterestRateModel,
    addressList[_network].PriceOracle,
    addressList[_network].Checker,
    "Furion Furion Token",
    "fFUR",
  ]);
  console.log(`fFUR deployed to: ${ffur.address} on ${_network}`);

  const ffur_market = {
    name: "fFUR",
    address: ffur.address,
  };
  marketList[_network][market_counter] = ffur_market;
  incMarketCounter();

  // Deploy fUSDC
  const fusdc = await deployUpgradeable(ethers, upgrades, "FErc20", [
    addressList[_network].MockUSD,
    addressList[_network].RiskManager,
    addressList[_network].JumpInterestRateModel,
    addressList[_network].PriceOracle,
    addressList[_network].Checker,
    "Furion USD",
    "fUSDC",
  ]);
  console.log(`fUSDC deployed to: ${fusdc.address} on ${_network}`);

  const fusdc_market = {
    name: "fUSDC",
    address: fusdc.address,
  };
  marketList[_network][market_counter] = fusdc_market;
  incMarketCounter();

  // Set price oracle prices
  await po.setUnderlyingPrice(feth.address, ethers.utils.parseUnits("1700", 18), (1e18).toString());
  console.log("Price of ETH set");
  await po.setUnderlyingPrice(ffur.address, (5e18).toString(), (1e18).toString());
  console.log("Price of FUR set");
  await po.setUnderlyingPrice(fusdc.address, (1e18).toString(), (1e6).toString());
  console.log("Price of USDC set");

  // Support markets
  await rm.supportMarket(feth.address, (0.6e18).toString(), 2);
  console.log("fETH supported");
  await rm.supportMarket(ffur.address, (0.4e18).toString(), 3);
  console.log("fFUR supported");
  await rm.supportMarket(fusdc.address, (0.85e18).toString(), 1);
  console.log("fUSDC supported");

  storeAddressList(addressList);
  storeMarketList(marketList);
});
