import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../scripts/contractAddress";
import { getNetwork } from "../helpers";

task("Checker:SetSPF", "Set separate pool factory")
  .addParam("spf", "Address of separate pool factory")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const network = getNetwork();
    const addressList = readAddressList();

    const checker = await ethers.getContractAt("Checker", addressList[network].Checker);
    const tx = await checker.setSPFactory(taskArguments.spf);
    await tx.wait(4);
    console.log("Separate pool factory added to checker");
  });

task("Checker:SetAPF", "Set aggregate pool factory")
  .addParam("apf", "Address of aggregate pool factory")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const network = getNetwork();
    const addressList = readAddressList();

    const checker = await ethers.getContractAt("Checker", addressList[network].Checker);
    const tx = await checker.setAPFactory(taskArguments.apf);
    await tx.wait(4);
    console.log("Aggregate pool factory added to checker");
  });
