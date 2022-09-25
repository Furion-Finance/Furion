import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

task("deploy:veFUR", "Deploy veFUR contract").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addresses = readAddressList();

  const furionAddr = addresses[_network].FurionToken;
  const veFUR = await deploy(ethers, "VoteEscrowedFurion");

  console.log(`VoteEscrowedFurion deployed to: ${veFUR.address} on ${_network}`);

  addresses[_network].VoteEscrowedFurion = veFUR.address;
  storeAddressList(addresses);

  if (_network != "localhost") {
    try {
      console.log("Waiting for confirmation...");
      await veFUR.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: veFUR.address,
      });
    } catch (e: any) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${veFUR.address}`);
      }
    }
  }
});
