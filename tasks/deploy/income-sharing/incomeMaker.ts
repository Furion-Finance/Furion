import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

task("deploy:IncomeMaker", "Deploy Income Maker contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addresses = readAddressList();

  const _incomeToken = addresses[_network].FurionToken;
  const _factory = addresses[_network].FurionSwapFactory;
  const _router = addresses[_network].FurionSwapV2Router;
  const _incomeSharingVault = addresses[_network].IncomeSharingVault;
  const incomeMaker = await deploy(ethers, "IncomeMaker");
  addresses[_network].IncomeMaker = incomeMaker.address;
  storeAddressList(addresses);

  const tx = await incomeMaker.initialize(_incomeToken, _router, _factory, _incomeSharingVault);
  await tx.wait();

  if (_network != "localhost") {
    try {
      console.log("Waiting for confirmation...");
      await incomeMaker.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: incomeMaker.address,
      });
    } catch (e: any) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${incomeMaker.address}`);
      }
    }
  }

  console.log("Task deploy:IncomeMaker ended successfully");
});
