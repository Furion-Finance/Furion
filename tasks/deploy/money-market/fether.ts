import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, readMarketList, storeMarketList } from "../../../scripts/contractAddress";
import { deployUpgradeable } from "../../helpers";

task("deploy:FEther", "Deploy FEther contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers, upgrades },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;

  const addressList = readAddressList();
  let marketList = readMarketList();

  const feth = await deployUpgradeable(ethers, upgrades, "FEther", [
    addressList[_network].RiskManager,
    addressList[_network].NormalInterestRateModel,
    addressList[_network].PriceOracle,
    addressList[_network].Checker,
  ]);

  console.log();
  console.log(`FEther deployed to: ${feth.address}`);

  const market = {
    name: "fETH",
    address: feth.address,
  };

  const counter = marketList[_network]["counter"];
  marketList[_network][counter] = market;
  marketList[_network]["counter"]++;
  storeMarketList(marketList);

  if (_network != "localhost") {
    const implementation = await upgrades.erc1967.getImplementationAddress(feth.address);
    try {
      console.log("Waiting confirmations before verifying...");
      await feth.deployTransaction.wait(4);
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
