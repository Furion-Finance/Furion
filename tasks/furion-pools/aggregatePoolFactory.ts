import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import {
  ap_counter,
  incApCounter,
  readAddressList,
  readAggregatePoolList,
  readSeparatePoolList,
  storeAggregatePoolList,
} from "../../scripts/contractAddress";

const addressList = readAddressList();
const separatePoolList = readSeparatePoolList();
const aggregatePoolList = readAggregatePoolList();
const counter = ap_counter;

task("create:AggregatePool", "Create aggregate pool")
  .addParam("nfts", "Addresses of nfts to be included in the pool")
  .addParam("name", "Name of the pool / FFT token")
  .addParam("symbol", "Symbol of the pool / FFT token")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const hre = require("hardhat");
    const { network } = hre;
    const _network = network.name == "hardhat" ? "localhost" : network.name;

    const apf = await ethers.getContractAt("AggregatePoolFactory", addressList[_network].AggregatePoolFactory);
    const poolAddress = await apf.callStatic.createPool(taskArguments.nfts, taskArguments.name, taskArguments.symbol);
    const tx = await apf.createPool(taskArguments.nft);
    await tx.wait();
    console.log(`Aggregate pool deployed to ${poolAddress} on ${_network}`);

    const ap = await ethers.getContractAt("AggregatePool", poolAddress);
    const poolName = await ap.name();
    const indexOfSpace = poolName.indexOf(" ");

    const poolObject = {
      name: poolName.substring(indexOfSpace + 1),
      address: poolAddress,
    };

    aggregatePoolList[_network][counter] = poolObject;
    incApCounter();
    storeAggregatePoolList(aggregatePoolList);
  });

task("create:CoolAggregatePool", "Create Cool Cats aggregate pool").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;

  const apf = await ethers.getContractAt("AggregatePoolFactory", addressList[_network].AggregatePoolFactory);
  const poolAddress = await apf.callStatic.createPool(
    ["0x922FF509992aA43c4AB5f84f7Efb266E250f1895"],
    "Cool Cats",
    "COOL",
  );
  const tx = await apf.createPool(["0x922FF509992aA43c4AB5f84f7Efb266E250f1895"], "Cool Cats", "COOL");
  await tx.wait();
  console.log(`Cool Cats aggregate pool deployed to ${poolAddress} on ${_network}`);

  const ap = await ethers.getContractAt("AggregatePool", poolAddress);
  const poolName = await ap.name();
  const indexOfSpace = poolName.indexOf(" ");

  const poolObject = {
    name: poolName.substring(indexOfSpace + 1),
    address: poolAddress,
  };

  aggregatePoolList[_network][counter] = poolObject;
  incApCounter();
  storeAggregatePoolList(aggregatePoolList);
});
