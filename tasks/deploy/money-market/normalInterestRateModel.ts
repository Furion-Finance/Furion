import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

const addressList = readAddressList();

task("deploy:NormalInterestRateModel", "Deploy normal interest rate model contract")
  .addParam("baserate", "Base rate per year")
  .addParam("multiplier", "Multiplier per year")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const baseRateMantissa = ethers.utils.parseUnits(taskArguments.baserate, 18);
    const multiplierMantissa = ethers.utils.parseUnits(taskArguments.multiplier, 18);

    const hre = require("hardhat");
    const { network } = hre;
    const _network = network.name == "hardhat" ? "localhost" : network.name;

    const nirm = await deploy(ethers, "NormalInterestRateModel", baseRateMantissa, multiplierMantissa);

    console.log();
    console.log(`Normal interest rate model deployed to: ${nirm.address} on ${_network}`);

    addressList[_network].NormalInterestRateModel = nirm.address;
    storeAddressList(addressList);

    if (_network != "localhost") {
      try {
        console.log("Waiting confirmations before verifying...");
        await nirm.deployTransaction.wait(4);
        await hre.run("verify:verify", {
          address: nirm.address,
          constructorArguments: [baseRateMantissa, multiplierMantissa],
        });
      } catch (e) {
        const array = e.message.split(" ");
        if (array.includes("Verified") || array.includes("verified")) {
          console.log("Already verified");
        } else {
          console.log(e);
          console.log(`Check manually at https://${_network}.etherscan.io/address/${nirm.address}`);
        }
      }
    }
  });
