import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deployUpgradeable } from "../../helpers";

const addressList = readAddressList();

task("deploy:RiskManager", "Deploy risk manager contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers, upgrades },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;

  const rm = await deployUpgradeable(ethers, upgrades, "RiskManager", [addressList[_network].PriceOracle]);

  console.log();
  console.log(`Risk manager deployed to: ${rm.address} on ${_network}`);

  addressList[_network].RiskManager = rm.address;
  storeAddressList(addressList);

  if (_network != "localhost") {
    const implementation = await upgrades.erc1967.getImplementationAddress(rm.address);
    try {
      console.log("Waiting confirmations before verifying...");
      await rm.deployTransaction.wait(4);
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
