import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { clearAggregatePoolList, readAddressList } from "../../../scripts/contractAddress";
import { deploy, getNetwork, writeDeployment } from "../../helpers";

task("deploy:AggregatePoolFactory", "Deploy aggregate pool factory contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const network = getNetwork();
  const addressList = readAddressList();

  const args = [
    addressList[network].IncomeMaker,
    addressList[network].Checker,
    addressList[network].FurionToken,
    addressList[network].FurionPricingOracle,
  ];
  const apf = await deploy(ethers, "AggregatePoolFactory", args);

  console.log();
  console.log(`Aggregate pool factory deployed to: ${apf.address} on ${network}`);

  writeDeployment(network, "AggregatePoolFactory", apf.address, args);

  clearAggregatePoolList();

  await hre.run("Checker:SetAPF", { apf: apf.address });
});
