import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

task("deploy:FurionSwapFactory", "Deploy FurionSwapFactory contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addressList = readAddressList();

  const furionSwapFactory = await deploy(ethers, "FurionSwapFactory", addressList[_network].IncomeMaker);

  console.log();
  console.log(`FurionSwapFactory deployed to: ${furionSwapFactory.address} on ${_network}`);

  addressList[_network].FurionSwapFactory = furionSwapFactory.address;
  storeAddressList(addressList);

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await furionSwapFactory.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: furionSwapFactory.address,
        constructorArguments: [addressList[_network].IncomeMaker],
      });
    } catch (e: any) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${furionSwapFactory.address}`);
      }
    }
  }
});
