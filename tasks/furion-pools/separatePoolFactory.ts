import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import {
  incSpCounter,
  readAddressList,
  readSeparatePoolList,
  sp_counter,
  storeSeparatePoolList,
} from "../../scripts/contractAddress";

const addressList = readAddressList();
const separatePoolList = readSeparatePoolList();
const counter = sp_counter;

task("create:SeparatePool", "Create seaparate pool")
  .addParam("nft", "Address of nft")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const hre = require("hardhat");
    const { network } = hre;
    const _network = network.name == "hardhat" ? "localhost" : network.name;

    const spf = await ethers.getContractAt("SeparatePoolFactory", addressList[_network].SeparatePoolFactory);
    const poolAddress = await spf.callStatic.createPool(taskArguments.nft);
    const tx = await spf.createPool(taskArguments.nft);
    await tx.wait();
    console.log(`Separate pool deployed to ${poolAddress} on ${_network}`);

    const sp = await ethers.getContractAt("SeparatePool", poolAddress);
    const poolName = await sp.name();
    const indexOfSpace = poolName.indexOf(" ");

    const poolObject = {
      name: poolName.substring(indexOfSpace + 1),
      address: poolAddress,
    };

    separatePoolList[_network][counter] = poolObject;
    incSpCounter();
    storeSeparatePoolList(separatePoolList);
  });

task("create:CoolSeparatePool", "Create Cool Cats seaparate pool").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addressList = readAddressList();

  const spf = await ethers.getContractAt("SeparatePoolFactory", addressList[_network].SeparatePoolFactory);
  const poolAddress = await spf.callStatic.createPool(addressList[_network].CoolCats);
  const tx = await spf.createPool(addressList[_network].CoolCats);
  await tx.wait();
  console.log(`Cool Cats separate pool deployed to ${poolAddress} on ${_network}`);

  const sp = await ethers.getContractAt("SeparatePool", poolAddress);
  const poolName = await sp.name();
  const indexOfSpace = poolName.indexOf(" ");

  const poolObject = {
    name: poolName.substring(indexOfSpace + 1),
    address: poolAddress,
  };

  separatePoolList[_network][counter] = poolObject;
  incSpCounter();
  storeSeparatePoolList(separatePoolList);
});
