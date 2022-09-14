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

    console.log(`Normal interest rate model deployed to: ${nirm.address} on ${_network}`);

    addressList[_network].NormalInterestRateModel = nirm.address;
    storeAddressList(addressList);
  });
