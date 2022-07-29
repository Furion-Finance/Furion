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

const addressList = readAddressList();
const farmingPoolList = readFarmingPoolList();

task("addFarmingMinter", "Add FUR minter to farming contract").setAction(async (_, hre) => {
  const { network } = hre;

  // Signers
  const [dev] = await hre.ethers.getSigners();
  console.log("The default signer is: ", dev.address);

  const farmingPoolAddress = addressList[network.name].FarmingPoolUpgradeable;
  const FurionTokenAddress = addressList[network.name].FurionToken;

  // Get the contract instance
  const FurionToken: FurionToken__factory = await hre.ethers.getContractFactory("FurionToken");
  const Furion: FurionToken = FurionToken.attach(FurionTokenAddress);

  // Add minter for Furion token
  const isAlready = await Furion.isMinter(farmingPoolAddress);
  if (!isAlready) {
    const tx = await Furion.addMinter(farmingPoolAddress);
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
  .setAction(async (taskArgs, hre) => {
    const poolName = taskArgs.name;
    const lptokenAddress = taskArgs.address;
    const basicFurionPerSecond = taskArgs.reward;

    console.log("The pool name is: ", poolName);
    console.log("LP token address to be added: ", lptokenAddress);
    console.log("Basic reward speed: ", basicFurionPerSecond, "Furion/second");

    const { network } = hre;

    // Signers
    const [dev] = await hre.ethers.getSigners();
    console.log("The default signer is: ", dev.address);

    const farmingPoolAddress = addressList[network.name].FarmingPoolUpgradeable;
    console.log("The farming pool address of ", network.name, " is: ", farmingPoolAddress);

    const FarmingPool: FarmingPoolUpgradeable__factory = await hre.ethers.getContractFactory("FarmingPoolUpgradeable");
    const farmingPool: FarmingPoolUpgradeable = FarmingPool.attach(farmingPoolAddress);

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
    farmingPoolList[network.name][poolId.toNumber()] = poolObject;

    console.log("Farming pool list now: ", farmingPoolList);
    storeFarmingPoolList(farmingPoolList);
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

    const { network } = hre;

    // Signers
    const [dev] = await hre.ethers.getSigners();
    console.log("The default signer is: ", dev.address);

    const farmingPoolAddress = addressList[network.name].FarmingPoolUpgradeable;
    console.log("The farming pool address of ", network.name, " is: ", farmingPoolAddress);
    const FarmingPool: FarmingPoolUpgradeable__factory = await hre.ethers.getContractFactory("FarmingPoolUpgradeable");
    const farmingPool: FarmingPoolUpgradeable = FarmingPool.attach(farmingPoolAddress);

    // Set the start block
    const tx = await farmingPool.setFurionReward(poolId, parseUnits(basicFurionPerSecond), false);
    console.log("Tx hash: ", (await tx.wait()).transactionHash);

    // Check the result
    const poolInfo = await farmingPool.poolList(poolId);
    console.log("Furion reward after set: basic - ", formatEther(poolInfo.basicFurionPerSecond));

    // Store the new farming pool
    farmingPoolList[network.name][poolId].reward = formatEther(poolInfo.basicFurionPerSecond);
    console.log("Farming pool list now: ", farmingPoolList);
    storeFarmingPoolList(farmingPoolList);
  });
