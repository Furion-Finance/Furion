import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import {
  clearSeparatePoolList,
  readAddressList,
  resetSpCounter,
  storeAddressList,
} from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

task("deploy:SeparatePoolFactory", "Deploy seaparate pool factory contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addressList = readAddressList();

  const spf = await deploy(
    ethers,
    "SeparatePoolFactory",
    addressList[_network].IncomeMaker,
    addressList[_network].Checker,
    addressList[_network].FurionToken,
  );

  console.log(`Separate pool factory deployed to: ${spf.address} on ${_network}`);

  addressList[_network].SeparatePoolFactory = spf.address;
  storeAddressList(addressList);

  resetSpCounter();
  clearSeparatePoolList();

  const checker = await ethers.getContractAt("Checker", addressList[_network].Checker);
  const tx = await checker.setSPFactory(spf.address);
  await tx.wait();

  console.log("Separate pool factory added to checker");
});
