import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, readSeparatePoolList } from "../../scripts/contractAddress";
import { getNetwork, writeAggregatePool } from "../helpers";

task("create:AggregatePool", "Create aggregate pool")
  .addVariadicPositionalParam("nfts", "Addresses of separate pools to be included in the pool")
  .addParam("name", "Name of the FFT token")
  .addParam("symbol", "Symbol of FFT token")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const network = getNetwork();
    const addressList = readAddressList();

    const apf = await ethers.getContractAt("AggregatePoolFactory", addressList[network].AggregatePoolFactory);
    const poolAddress = await apf.callStatic.createPool(taskArguments.nfts, taskArguments.name, taskArguments.symbol);
    const tx = await apf.createPool(taskArguments.nfts, taskArguments.name, taskArguments.symbol);
    await tx.wait();
    console.log();
    console.log(`Aggregate pool deployed to ${poolAddress} on ${network}`);

    const ap = await ethers.getContractAt("AggregatePool", poolAddress);
    const poolSymbol = await ap.symbol();
    const poolName = await ap.name();
    const indexOfSpace = poolName.indexOf(" ");
    const signers = await ethers.getSigners();
    const args = [
      addressList[network].IncomeMaker,
      addressList[network].FurionToken,
      addressList[network].FurionPricingOracle,
      signers[0].address,
      taskArguments.nfts,
      poolName,
      poolSymbol,
    ];
    writeAggregatePool(network, poolName.substring(indexOfSpace + 1), poolSymbol, poolAddress, args);
  });

const addresses = readAddressList()["goerli"];
const poolInfo = [
  {
    nfts: [addresses.BAYC, addresses.MAYC, addresses.Otherdeed, addresses.BAKC],
    name: "BAYC Ecosystem",
    symbol: "BAYC",
  },
  {
    nfts: [addresses.CryptoPunks, addresses.Azuki, addresses.Doodles, addresses.BAYC, addresses.Meebits],
    name: "Bluechips",
    symbol: "BLUECHIP",
  },
  {
    nfts: [addresses["Weirdo Ghost Gang"], addresses.Catddle, addresses["Mimic Shhans"]],
    name: "Dark Horses",
    symbol: "DARKHORSE",
  },
];

task("create:TestnetAggregatePools", "Create all 3 aggregate pools for testnet").setAction(async function () {
  const hre = require("hardhat");
  const network = getNetwork();

  for (let pool of poolInfo) {
    if (pool.name != "BAYC Ecosystem") {
      await hre.run("create:AggregatePool", {
        nfts: pool.nfts,
        name: pool.name,
        symbol: pool.symbol,
      });
    }
  }
});
