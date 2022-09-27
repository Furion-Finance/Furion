import "@nomiclabs/hardhat-ethers";
import { formatEther, parseUnits } from "ethers/lib/utils";
import { subtask, task, types } from "hardhat/config";

import { readAddressList, readFarmingPoolList, storeFarmingPoolList } from "../../scripts/contractAddress";
import { stablecoinToWei, toWei } from "../../test/utils";
import {
  FarmingPoolUpgradeable,
  FarmingPoolUpgradeable__factory,
  FurionToken,
  FurionToken__factory,
} from "../../typechain";
import { getNetwork, writeFarmingPool } from "../helpers";

const addressList = readAddressList();
const farmingPoolList = readFarmingPoolList();

task("addFarmingMinter", "Add FUR minter to farming contract").setAction(async (_, { ethers }) => {
  const network = getNetwork();

  const farmingPoolAddress = addressList[network].FarmingPoolUpgradeable;

  // Get the contract instance
  const fur = await ethers.getContractAt("FurionToken", addressList[network].FurionToken);

  // Add minter for Furion token
  const isAlready = await fur.isMinter(farmingPoolAddress);
  if (!isAlready) {
    const tx = await fur.addMinter(farmingPoolAddress);
    console.log(await tx.wait());
  }
  console.log("\nFinish adding minter for farming contract...\n");
});

// npx hardhat addFarmingPool--name USD
// --address 0x0944729C5125576a7DB450F7F730dC5A2a1E1359
// --reward 10000 --network localhost
task("addFarmingPool", "Add new farming pool")
  .addParam("name", "The name of the new farming pool", "unnamed", types.string)
  .addParam("address", "The LP token address to be added", null, types.string)
  .addParam("reward", "Initial FUR reward per second", null, types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const poolName = taskArgs.name;
    const lptokenAddress = taskArgs.address;
    const basicFurionPerSecond = taskArgs.reward;

    console.log("The pool name is: ", poolName);
    console.log("LP token address to be added: ", lptokenAddress);
    console.log("Basic reward speed: ", basicFurionPerSecond, "Furion/second");

    const network = getNetwork();

    const farmingPool = await ethers.getContractAt(
      "FarmingPoolUpgradeable",
      addressList[network].FarmingPoolUpgradeable,
    );

    console.log("farming basic speed", parseUnits(basicFurionPerSecond).toString());

    console.log("New reward speed: ", basicFurionPerSecond * 86400, "Furion/day");

    const tx = await farmingPool.add(lptokenAddress, parseUnits(basicFurionPerSecond), false);
    console.log("tx details: ", await tx.wait());

    // Check the result
    const poolId = await farmingPool.poolMapping(lptokenAddress);
    const poolInfo = await farmingPool.poolList(poolId);
    console.log("Pool info: ", poolInfo);

    // Store the new farming pool
    const poolObject = {
      name: poolName,
      address: lptokenAddress,
      poolId: poolId.toNumber(),
      reward: formatEther(poolInfo.basicFurionPerSecond),
    };
    writeFarmingPool(network, poolObject);
  });

task("setFarmingPoolFurionReward", "Set the Furion reward of a farming pool")
  .addParam("id", "Pool id", null, types.int)
  .addParam("reward", "Basic Furion reward per second", null, types.string)
  .setAction(async (taskArgs, hre) => {
    // Get the args
    const poolId = taskArgs.id;
    const basicFurionPerSecond = taskArgs.reward;

    console.log("Pool id to be set: ", poolId);
    console.log("New reward speed: ", basicFurionPerSecond * 86400, "Furion/day");

    const network = getNetwork();

    const farmingPool = await ethers.getContractAt(
      "FarmingPoolUpgradeable",
      addressList[network].FarmingPoolUpgradeable,
    );

    // Set the start block
    const tx = await farmingPool.setFurionReward(poolId, parseUnits(basicFurionPerSecond), false);
    console.log("Tx hash: ", (await tx.wait()).transactionHash);

    // Check the result
    const poolInfo = await farmingPool.poolList(poolId);
    console.log("Furion reward after set: basic - ", formatEther(poolInfo.basicFurionPerSecond));

    // Store the new farming pool
    farmingPoolList[network][poolId].reward = formatEther(poolInfo.basicFurionPerSecond);
    console.log("Farming pool list now: ", farmingPoolList);
    storeFarmingPoolList(farmingPoolList);
  });
