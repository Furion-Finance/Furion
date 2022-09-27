import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../../scripts/contractAddress";
import { deploy, getNetwork, writeDeployment } from "../../helpers";

task("deploy:TestClaim", "Deploy TestClaim contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const network = getNetwork();
  const addressList = readAddressList();

  const args = [addressList[network].FurionToken, addressList[network].MockUSD, addressList[network].CoolCats];
  const testClaim = await deploy(ethers, "TestClaim", args);

  console.log();
  console.log(`TestClaim deployed to: ${testClaim.address} on ${network}`);

  writeDeployment(network, "TestClaim", testClaim.address, args);
});
