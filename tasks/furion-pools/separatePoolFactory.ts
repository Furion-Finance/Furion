import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../scripts/contractAddress";
import { getNetwork, writeSeparatePool } from "../helpers";

task("create:SeparatePool", "Create seaparate pool")
  .addParam("nft", "Address of nft")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const network = getNetwork();
    const addressList = readAddressList();

    const spf = await ethers.getContractAt("SeparatePoolFactory", addressList[network].SeparatePoolFactory);
    const poolAddress = await spf.callStatic.createPool(taskArguments.nft);
    const tx = await spf.createPool(taskArguments.nft);
    await tx.wait();
    console.log();
    console.log(`Separate pool deployed to ${poolAddress} on ${network}`);

    const sp = await ethers.getContractAt("SeparatePool", poolAddress);
    const poolSymbol = await sp.symbol();
    const poolName = await sp.name();
    const indexOfSpace = poolName.indexOf(" ");
    const signers = await ethers.getSigners();
    const args = [
      taskArguments.nft,
      addressList[network].IncomeMaker,
      addressList[network].FurionToken,
      signers[0].address,
      poolName,
      poolSymbol,
    ];
    writeSeparatePool(network, poolName.substring(indexOfSpace + 1), poolAddress, args);
  });

task("create:CoolSeparatePool", "Create Cool Cats seaparate pool").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const network = getNetwork();
  const addressList = readAddressList();

  const spf = await ethers.getContractAt("SeparatePoolFactory", addressList[network].SeparatePoolFactory);
  const poolAddress = await spf.callStatic.createPool(addressList[network].CoolCats);
  const tx = await spf.createPool(addressList[network].CoolCats);
  await tx.wait();
  console.log();
  console.log(`Cool Cats separate pool deployed to ${poolAddress} on ${network}`);

  const sp = await ethers.getContractAt("SeparatePool", poolAddress);
  const poolSymbol = await sp.symbol();
  const poolName = await sp.name();
  const indexOfSpace = poolName.indexOf(" ");
  const signers = await ethers.getSigners();
  const args = [
    addressList[network].CoolCats,
    addressList[network].IncomeMaker,
    addressList[network].FurionToken,
    signers[0].address,
    poolName,
    poolSymbol,
  ];
  writeSeparatePool(network, poolName.substring(indexOfSpace + 1), poolAddress, args);
});
