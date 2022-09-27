import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../scripts/contractAddress";
import { getNetwork } from "../helpers";

task("Swap:SetIncomeMaker", "Set the income maker address inside naughty factory")
  .addParam("incomemaker", "New Income Maker address")
  .setAction(async function (taskArgs: TaskArguments, { ethers }) {
    console.log("\nSetting income maker in factory...\n");
    const network = getNetwork();
    const addressList = readAddressList();

    const factory = await ethers.getContractAt("FurionSwapFactory", addressList[network].FurionSwapFactory);

    // Set
    const tx = await factory.setIncomeMakerAddress(taskArgs.incomemaker);
    console.log("Tx details: ", await tx.wait());
  });

task("Swap:SetIncomeMakerProportion", "Set new proportion for FurionSwap's income maker")
  .addParam("proportion", "New proportion")
  .setAction(async (taskArgs, { ethers }) => {
    console.log("\n Setting new proportion for FurionSwap... \n");

    const network = getNetwork();
    const addressList = readAddressList();

    const factory = await ethers.getContractAt("FurionSwapFactory", addressList[network].FurionSwapFactory);

    const tx = await factory.setIncomeMakerProportion(taskArgs.proportion);
    console.log("Tx details:", await tx.wait());

    console.log("\n Finish setting new income maker proportion for FurionSwap \n");
  });
