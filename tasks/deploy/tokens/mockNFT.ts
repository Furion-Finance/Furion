import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

task("deploy:MockCoolCats", "Deploy mock CoolCats").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addressList = readAddressList();

  const coolCats = await deploy(ethers, "CoolCats", null);

  console.log();
  console.log(`CoolCats deployed to: ${coolCats.address} on ${_network}`);

  addressList[_network].CoolCats = coolCats.address;
  storeAddressList(addressList);

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await coolCats.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: coolCats.address,
      });
    } catch (e: any) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${coolCats.address}`);
      }
    }
  }
});
