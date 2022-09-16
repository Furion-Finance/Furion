import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../scripts/contractAddress";
import { deploy } from "../helpers";

task("deploy:Checker", "Deploy checker contract").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addressList = readAddressList();

  const checker = await deploy(ethers, "Checker", null);

  console.log();
  console.log(`Checker deployed to: ${checker.address} on ${_network}`);

  addressList[_network].Checker = checker.address;
  storeAddressList(addressList);

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await checker.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: checker.address,
      });
    } catch (e) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${checker.address}`);
      }
    }
  }
});
