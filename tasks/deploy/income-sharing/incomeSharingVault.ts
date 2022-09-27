import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

task("deploy:IncomeSharingVault", "Deploy Income Sharing Vault contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addresses = readAddressList();

  const incomeSharingVault = await deploy(ethers, "IncomeSharingVault");
  addresses[_network].IncomeSharingVault = incomeSharingVault.address;
  storeAddressList(addresses);

  const tx = await incomeSharingVault.initialize(addresses[_network].VoteEscrowedFurion);
  await tx.wait();

  if (_network != "localhost") {
    try {
      console.log("Waiting for confirmation...");
      await incomeSharingVault.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: incomeSharingVault.address,
      });
    } catch (e: any) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${incomeSharingVault.address}`);
      }
    }
  }

  console.log("Task deploy:IncomeSharingVault ended successfully");
});
