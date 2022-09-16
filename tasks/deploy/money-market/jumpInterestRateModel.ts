import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

const addressList = readAddressList();

task("deploy:JumpInterestRateModel", "Deploy jump interest rate model contract")
  .addParam("baserate", "Base rate per year")
  .addParam("multiplier", "Multiplier per year")
  .addParam("jumpmultiplier", "Jump multiplier per year")
  .addParam("kink", "Utilization rate where jump multiplier is used")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const baseRateMantissa = ethers.utils.parseUnits(taskArguments.baserate, 18);
    const multiplierMantissa = ethers.utils.parseUnits(taskArguments.multiplier, 18);
    const jumpMultiplierMantissa = ethers.utils.parseUnits(taskArguments.jumpmultiplier, 18);
    const kinkMantissa = ethers.utils.parseUnits(taskArguments.kink, 18);

    const hre = require("hardhat");
    const { network } = hre;
    const _network = network.name == "hardhat" ? "localhost" : network.name;

    const jirm = await deploy(
      ethers,
      "JumpInterestRateModel",
      baseRateMantissa,
      multiplierMantissa,
      jumpMultiplierMantissa,
      kinkMantissa,
    );

    console.log();
    console.log(`Jump interest rate model deployed to: ${jirm.address} on ${_network}`);

    addressList[_network].JumpInterestRateModel = jirm.address;
    storeAddressList(addressList);

    if (_network != "localhost") {
      try {
        console.log("Waiting confirmations before verifying...");
        await jirm.deployTransaction.wait(4);
        await hre.run("verify:verify", {
          address: jirm.address,
          constructorArguments: [baseRateMantissa, multiplierMantissa, jumpMultiplierMantissa, kinkMantissa],
        });
      } catch (e) {
        const array = e.message.split(" ");
        if (array.includes("Verified") || array.includes("verified")) {
          console.log("Already verified");
        } else {
          console.log(e);
          console.log(`Check manually at https://${_network}.etherscan.io/address/${jirm.address}`);
        }
      }
    }
  });
