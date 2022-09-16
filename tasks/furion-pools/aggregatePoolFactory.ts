import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import {
  readAddressList,
  readAggregatePoolList,
  readSeparatePoolList,
  storeAggregatePoolList,
} from "../../scripts/contractAddress";

task("create:AggregatePool", "Create aggregate pool")
  .addParam("nfts", "Addresses of nfts to be included in the pool")
  .addParam("name", "Name of the pool / FFT token")
  .addParam("symbol", "Symbol of the pool / FFT token")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const hre = require("hardhat");
    const { network } = hre;
    const _network = network.name == "hardhat" ? "localhost" : network.name;

    const addressList = readAddressList();
    const separatePoolList = readSeparatePoolList();
    let aggregatePoolList = readAggregatePoolList();

    const apf = await ethers.getContractAt("AggregatePoolFactory", addressList[_network].AggregatePoolFactory);
    const poolAddress = await apf.callStatic.createPool(taskArguments.nfts, taskArguments.name, taskArguments.symbol);
    const tx = await apf.createPool(taskArguments.nfts, taskArguments.name, taskArguments.symbol);
    await tx.wait();
    console.log();
    console.log(`Aggregate pool deployed to ${poolAddress} on ${_network}`);

    const ap = await ethers.getContractAt("AggregatePool", poolAddress);
    const poolName = await ap.name();
    const indexOfSpace = poolName.indexOf(" ");

    const poolObject = {
      name: poolName.substring(indexOfSpace + 1),
      address: poolAddress,
    };

    const counter = aggregatePoolList[_network]["counter"];
    aggregatePoolList[_network][counter] = poolObject;
    aggregatePoolList[_network]["counter"]++;
    storeAggregatePoolList(aggregatePoolList);

    if (_network != "localhost") {
      try {
        console.log("Waiting confirmations before verifying...");
        await tx.wait(3);
        const signers = await ethers.getSigners();
        const poolSymbol = await ap.symbol();
        await hre.run("verify:verify", {
          address: poolAddress,
          constructorArguments: [
            addressList[_network].FurionToken,
            addressList[_network].FurionPricingOracle,
            addressList[_network].SeparatePoolFactory,
            signers[0].address,
            task.taskArguments.nfts,
            poolName,
            poolSymbol,
          ],
        });
      } catch (e) {
        const array = e.message.split(" ");
        if (array.includes("Verified") || array.includes("verified")) {
          console.log("Already verified");
        } else {
          console.log(e);
          console.log(`Check manually at https://${_network}.etherscan.io/address/${ap.address}`);
        }
      }
    }
  });

task("create:CoolAggregatePool", "Create Cool Cats aggregate pool").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;

  const addressList = readAddressList();
  const separatePoolList = readSeparatePoolList();
  let aggregatePoolList = readAggregatePoolList();

  const apf = await ethers.getContractAt("AggregatePoolFactory", addressList[_network].AggregatePoolFactory);
  const poolAddress = await apf.callStatic.createPool([separatePoolList[_network]["0"].address], "Cool Cats", "COOL");
  const tx = await apf.createPool([separatePoolList[_network]["0"].address], "Cool Cats", "COOL");
  await tx.wait();
  console.log();
  console.log(`Cool Cats aggregate pool deployed to ${poolAddress} on ${_network}`);

  const ap = await ethers.getContractAt("AggregatePool", poolAddress);
  const poolName = await ap.name();
  const indexOfSpace = poolName.indexOf(" ");

  const poolObject = {
    name: poolName.substring(indexOfSpace + 1),
    address: poolAddress,
  };

  const counter = aggregatePoolList[_network]["counter"];
  aggregatePoolList[_network][counter] = poolObject;
  aggregatePoolList[_network]["counter"]++;
  storeAggregatePoolList(aggregatePoolList);

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await tx.wait(3);
      const signers = await ethers.getSigners();
      const poolSymbol = await ap.symbol();
      await hre.run("verify:verify", {
        address: poolAddress,
        constructorArguments: [
          addressList[_network].FurionToken,
          addressList[_network].FurionPricingOracle,
          addressList[_network].SeparatePoolFactory,
          signers[0].address,
          [separatePoolList[_network]["0"].address],
          poolName,
          poolSymbol,
        ],
      });
    } catch (e) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${ap.address}`);
      }
    }
  }
});
