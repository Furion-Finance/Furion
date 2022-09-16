import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

const addressList = readAddressList();

task("deploy:PriceOracle", "Deploy price oracle contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;

  const po = await deploy(ethers, "SimplePriceOracle", null);

  console.log();
  console.log(`Price oracle deployed to: ${po.address} on ${_network}`);

  addressList[_network].PriceOracle = po.address;
  storeAddressList(addressList);

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await po.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: po.address,
      });
    } catch (e) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${po.address}`);
      }
    }
  }
});
