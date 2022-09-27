import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, readSeparatePoolList } from "../../scripts/contractAddress";
import { getNetwork, writeAggregatePool } from "../helpers";

task("create:AggregatePool", "Create aggregate pool")
  .addParam("pools", "Addresses of separate pools to be included in the pool")
  .addParam("name", "Name of the pool / FFT token")
  .addParam("symbol", "Symbol of the pool / FFT token")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const network = getNetwork();
    const addressList = readAddressList();

    const apf = await ethers.getContractAt("AggregatePoolFactory", addressList[network].AggregatePoolFactory);
    const poolAddress = await apf.callStatic.createPool(taskArguments.pools, taskArguments.name, taskArguments.symbol);
    const tx = await apf.createPool(taskArguments.pools, taskArguments.name, taskArguments.symbol);
    await tx.wait();
    console.log();
    console.log(`Aggregate pool deployed to ${poolAddress} on ${network}`);

    const ap = await ethers.getContractAt("AggregatePool", poolAddress);
    const poolSymbol = await ap.symbol();
    const poolName = await ap.name();
    const indexOfSpace = poolName.indexOf(" ");
    const signers = await ethers.getSigners();
    const args = [
      addressList[network].FurionToken,
      addressList[network].FurionPricingOracle,
      addressList[network].SeparatePoolFactory,
      signers[0].address,
      task.taskArguments.pools,
      poolName,
      poolSymbol,
    ];
    writeAggregatePool(network, poolName.substring(indexOfSpace + 1), poolAddress, args);
  });

task("create:CoolAggregatePool", "Create Cool Cats aggregate pool").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const network = getNetwork();
  const addressList = readAddressList();
  const separatePoolList = readSeparatePoolList();

  const apf = await ethers.getContractAt("AggregatePoolFactory", addressList[network].AggregatePoolFactory);
  const poolAddress = await apf.callStatic.createPool([separatePoolList[network]["0"].address], "Cool Cats", "COOL");
  const tx = await apf.createPool([separatePoolList[network]["0"].address], "Cool Cats", "COOL");
  await tx.wait();
  console.log();
  console.log(`Cool Cats aggregate pool deployed to ${poolAddress} on ${network}`);

  const ap = await ethers.getContractAt("AggregatePool", poolAddress);
  const poolSymbol = await ap.symbol();
  const poolName = await ap.name();
  const indexOfSpace = poolName.indexOf(" ");
  const signers = await ethers.getSigners();
  const args = [
    addressList[network].FurionToken,
    addressList[network].FurionPricingOracle,
    addressList[network].SeparatePoolFactory,
    signers[0].address,
    [separatePoolList[network]["0"].address],
    poolName,
    poolSymbol,
  ];
  writeAggregatePool(network, poolName.substring(indexOfSpace + 1), poolAddress, args);
});
