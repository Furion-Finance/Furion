import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, readMarketList, storeMarketList } from "../../../scripts/contractAddress";
import { deployUpgradeable } from "../../helpers";

task("deploy:FErc20", "Deploy FErc20 contract")
  .addParam("underlying", "Address of underlying asset")
  .addParam("jump", "Whether jump interest rate model is used, true/false")
  .addParam("name", "Name of market token")
  .addParam("symbol", "Symbol of market token")
  .setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
    const hre = require("hardhat");
    const { network } = hre;
    const _network = network.name == "hardhat" ? "localhost" : network.name;

    const addressList = readAddressList();
    let marketList = readMarketList();

    let args;

    if (taskArguments.jump == "true") {
      args = [
        taskArguments.underlying,
        addressList[_network].RiskManager,
        addressList[_network].JumpInterestRateModel,
        addressList[_network].PriceOracle,
        addressList[_network].Checker,
        taskArguments.name,
        taskArguments.symbol,
      ];
    } else {
      args = [
        taskArguments.underlying,
        addressList[_network].RiskManager,
        addressList[_network].NormalInterestRateModel,
        addressList[_network].PriceOracle,
        addressList[_network].Checker,
        taskArguments.name,
        taskArguments.symbol,
      ];
    }

    const ferc = await deployUpgradeable(ethers, upgrades, "FErc20", args);

    console.log();
    console.log(`${taskArguments.symbol} deployed to: ${ferc.address} on ${_network}`);

    const market = {
      name: taskArguments.symbol,
      address: ferc.address,
    };

    const counter = marketList[_network]["counter"];
    marketList[_network][counter] = market;
    marketList[_network]["counter"]++;
    storeMarketList(marketList);

    if (_network != "localhost") {
      const implementation = await upgrades.erc1967.getImplementationAddress(ferc.address);
      try {
        console.log("Waiting confirmations before verifying...");
        await ferc.deployTransaction.wait(4);
        await hre.run("verify:verify", {
          address: implementation,
        });
      } catch (e) {
        const array = e.message.split(" ");
        if (array.includes("Verified") || array.includes("verified")) {
          console.log("Already verified");
        } else {
          console.log(e);
          console.log(`Check manually at https://${_network}.etherscan.io/address/${implementation}`);
        }
      }
    }
  });
