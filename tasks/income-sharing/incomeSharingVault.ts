import "@nomiclabs/hardhat-ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { task, types } from "hardhat/config";

import { readAddressList } from "../../scripts/contractAddress";
import { IncomeSharingVault, IncomeSharingVault__factory } from "../../typechain";
import { getNetwork } from "../helpers";

// tasks
// 1. initialize

// tasks modifying the state of the contract
task("IncomeSharingVault:initialize", "Initialize Income Sharing Vault")
  .addParam("veFURAddress", "Address of veFUR token", null, types.string)
  .setAction(async (TaskArguments, hre) => {
    const _veFURAddress = TaskArguments.veFURAddress;
    const network = getNetwork();
    const addresses = readAddressList();

    const incomeSharingVaultFactory: IncomeSharingVault__factory = await hre.ethers.getContractFactory(
      "IncomeSharingVault",
    );
    const incomeSharingVault: IncomeSharingVault = incomeSharingVaultFactory.attach(
      addresses[network].IncomeSharingVault,
    );

    const tx = await incomeSharingVault.initialize(_veFURAddress);
    await tx.wait();

    console.log("Task IncomeSharingVault:initialize ended successfully");
  });

task("IncomeSharingVault:startPool", "Start new pool")
  .addParam("rewardtoken", "Address of the reward token", null, types.string)
  .setAction(async (TaskArgs, { ethers }) => {
    const network = getNetwork();
    const addresses = readAddressList();
    const vault = await ethers.getContractAt("IncomeSharingVault", addresses[network].IncomeSharingVault);

    const tx = await vault.startPool(TaskArgs.rewardtoken);
    console.log("Tx detail: ", await tx.wait());

    console.log("Task IncomeSharingVault:startPool ended successfully");
  });

task("IncomeSharingVault:setRoundTime", "Set round time")
  .addParam("time", "Time value", null, types.string)
  .setAction(async (TaskArgs, { ethers }) => {
    const time = parseUnits(TaskArgs.time);
    const network = getNetwork();
    const addresses = readAddressList();
    const vault = await ethers.getContractAt("IncomeSharingVault", addresses[network].IncomeSharingVault);

    const tx = await vault.setRoundTime(time);
    console.log("Tx details: ", await tx.wait());

    console.log("Task IncomeSharingVault:setRoundTime ended successfully");
  });

task("IncomeSharingVault:setRewardSpeed", "Set reward speed")
  .addParam("rewardspeed", "Value of the reward speed", null, types.string)
  .setAction(async (TaskArgs, { ethers }) => {
    const rewardspeed = parseUnits(TaskArgs.rewardspeed);
    const network = getNetwork();
    const addresses = readAddressList();
    const vault = await ethers.getContractAt("IncomeSharingVault", addresses[network].IncomeSharingVault);

    const tx = await vault.setRewardSpeed(rewardspeed);
    console.log("Tx details: ", await tx.wait());

    console.log("Task IncomeSharingVault:setRewardSpeed ended successfully");
  });

task("IncomeSharingVault:roundTime", "round time").setAction(async (TaskArgs, { ethers }) => {
  const network = getNetwork();
  const addresses = readAddressList();
  const vault = await ethers.getContractAt("IncomeSharingVault", addresses[network].IncomeSharingVault);

  const time = await vault.roundTime();
  console.log("Round time: ", formatUnits(time));
});

task("IncomeSharingVault:poolinfo", "Pool info")
  .addParam("rewardtoken", "address of the reward token", null, types.string)
  .setAction(async (TaskArgs, { ethers }) => {
    const network = getNetwork();
    const addresses = readAddressList();
    const vault = await ethers.getContractAt("IncomeSharingVault", addresses[network].IncomeSharingVault);

    const nextId = await vault.nextPool();
    for (let i = 0; i < nextId; i++) {
      const pool = await vault.pools(i);
      if (pool.rewardToken == TaskArgs.rewardtoken) {
        console.log("Pool Info: ", pool.toString());
        return;
      }
    }
    console.log("Pool with given reward token does not exist");
  });
