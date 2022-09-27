import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { clearSeparatePoolList, readAddressList } from "../../../scripts/contractAddress";
import { deploy, getNetwork, writeDeployment } from "../../helpers";

task("deploy:SeparatePoolFactory", "Deploy seaparate pool factory contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const network = getNetwork();
  const addressList = readAddressList();

  const args = [addressList[network].IncomeMaker, addressList[network].Checker, addressList[network].FurionToken];
  const spf = await deploy(ethers, "SeparatePoolFactory", args);

  console.log();
  console.log(`Separate pool factory deployed to: ${spf.address} on ${network}`);

  writeDeployment(network, "SeparatePoolFactory", spf.address, args);

  clearSeparatePoolList();

  await hre.run("Checker:SetSPF", {
    spf: spf.address,
  });
});
