import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../scripts/contractAddress";
import { deploy } from "../helpers";

task("deploy:Checker", "Deploy checker contract").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addressList = readAddressList();

  const checker = await deploy(ethers, "Checker", null);

  console.log(`Checker deployed to: ${checker.address} on ${_network}`);

  addressList[_network].Checker = checker.address;
  storeAddressList(addressList);
});
