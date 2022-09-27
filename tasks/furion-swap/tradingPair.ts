import "@nomiclabs/hardhat-ethers";
import { formatUnits } from "ethers/lib/utils";
import { task, types } from "hardhat/config";

import { getTokenAddressOnMainnet } from "../../info/tokenAddress";
import { readAddressList } from "../../scripts/contractAddress";
import { getNetwork, writeSwap } from "../helpers";

// npx hardhat createPair --token0 0x7d162a62AcAf017A2Ea55cEaCB00c85EeAB4DC5b
// --token1 0x4b9c28F574974e3B108bCB76856C5C2aa40bc14C --network localhost
task("create:SwapPair", "Create new trading pair in FurionSwap")
  .addParam("token0", "Address of token A")
  .addParam("token1", "Address of token B")
  .addParam("name0", "Name of token A")
  .addParam("name1", "Name of token B")
  .setAction(async (taskArgs, { ethers }) => {
    const tokenA = taskArgs.token0;
    const tokenB = taskArgs.token1;

    const nameA = taskArgs.name0;
    const nameB = taskArgs.name1;

    console.log("\n Creating new trading pair for FurionSwap... \n");
    console.log("Address of tokenA:", tokenA, nameA);
    console.log("\nAddress of tokenB", tokenB, nameB);

    const network = getNetwork();
    const addressList = readAddressList();

    const factory = await ethers.getContractAt("FurionSwapFactory", addressList[network].FurionSwapFactory);
    const tx = await factory.createPair(tokenA, tokenB);
    console.log("Tx details:", await tx.wait());

    const pairAddress = await factory.getPair(tokenA, tokenB);

    const pairObject = {
      token0: taskArgs.token0,
      token1: taskArgs.token1,
      name0: nameA,
      name1: nameB,
      pair: pairAddress,
    };
    writeSwap(network, pairObject);

    console.log("\n Finish creating new pair for FurionSwap, with pair address", pairAddress, "\n");
  });
