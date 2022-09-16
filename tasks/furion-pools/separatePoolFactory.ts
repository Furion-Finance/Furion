import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, readSeparatePoolList, storeSeparatePoolList } from "../../scripts/contractAddress";

task("create:SeparatePool", "Create seaparate pool")
  .addParam("nft", "Address of nft")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const hre = require("hardhat");
    const { network } = hre;
    const _network = network.name == "hardhat" ? "localhost" : network.name;

    const addressList = readAddressList();
    let separatePoolList = readSeparatePoolList();

    const spf = await ethers.getContractAt("SeparatePoolFactory", addressList[_network].SeparatePoolFactory);
    const poolAddress = await spf.callStatic.createPool(taskArguments.nft);
    const tx = await spf.createPool(taskArguments.nft);
    await tx.wait();
    console.log();
    console.log(`Separate pool deployed to ${poolAddress} on ${_network}`);

    const sp = await ethers.getContractAt("SeparatePool", poolAddress);
    const poolName = await sp.name();
    const indexOfSpace = poolName.indexOf(" ");

    const poolObject = {
      name: poolName.substring(indexOfSpace + 1),
      address: poolAddress,
    };

    const counter = separatePoolList[_network]["counter"];
    separatePoolList[_network][counter] = poolObject;
    separatePoolList[_network]["counter"]++;
    storeSeparatePoolList(separatePoolList);

    if (_network != "localhost") {
      try {
        console.log("Waiting confirmations before verifying...");
        await tx.wait(3);
        const signers = await ethers.getSigners();
        const poolSymbol = await sp.symbol();
        await hre.run("verify:verify", {
          address: poolAddress,
          constructorArguments: [
            taskArguments.nft,
            addressList[_network].IncomeMaker,
            addressList[_network].FurionToken,
            signers[0].address,
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
          console.log(`Check manually at https://${_network}.etherscan.io/address/${sp.address}`);
        }
      }
    }
  });

task("create:CoolSeparatePool", "Create Cool Cats seaparate pool").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;

  const addressList = readAddressList();
  let separatePoolList = readSeparatePoolList();

  const spf = await ethers.getContractAt("SeparatePoolFactory", addressList[_network].SeparatePoolFactory);
  const poolAddress = await spf.callStatic.createPool(addressList[_network].CoolCats);
  const tx = await spf.createPool(addressList[_network].CoolCats);
  await tx.wait();
  console.log();
  console.log(`Cool Cats separate pool deployed to ${poolAddress} on ${_network}`);

  const sp = await ethers.getContractAt("SeparatePool", poolAddress);
  const poolName = await sp.name();
  const indexOfSpace = poolName.indexOf(" ");

  const poolObject = {
    name: poolName.substring(indexOfSpace + 1),
    address: poolAddress,
  };

  const counter = separatePoolList[_network]["counter"];
  separatePoolList[_network][counter] = poolObject;
  separatePoolList[_network]["counter"]++;
  storeSeparatePoolList(separatePoolList);

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await tx.wait(3);
      const signers = await ethers.getSigners();
      const poolSymbol = await sp.symbol();
      await hre.run("verify:verify", {
        address: poolAddress,
        constructorArguments: [
          addressList[_network].CoolCats,
          addressList[_network].IncomeMaker,
          addressList[_network].FurionToken,
          signers[0].address,
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
        console.log(`Check manually at https://${_network}.etherscan.io/address/${sp.address}`);
      }
    }
  }
});
