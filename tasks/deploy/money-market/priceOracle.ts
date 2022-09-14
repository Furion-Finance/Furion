import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

const addressList = readAddressList();

task("deploy:PriceOracle", "Deploy price oracle contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;

  const po = await deploy(ethers, "SimplePriceOracle", null);

  console.log(`Price oracle deployed to: ${po.address} on ${_network}`);

  addressList[_network].PriceOracle = po.address;
  storeAddressList(addressList);
});
