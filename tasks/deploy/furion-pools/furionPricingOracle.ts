import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

task("deploy:FurionPricingOracle", "Deploy furion pricing oracle contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addressList = readAddressList();

  const fpo = await deploy(ethers, "FurionPricingOracle", null);

  console.log(`Furion pricing oracle deployed to: ${fpo.address} on ${_network}`);

  addressList[_network].FurionPricingOracle = fpo.address;
  storeAddressList(addressList);
});
