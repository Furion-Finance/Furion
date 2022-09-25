import "@nomiclabs/hardhat-ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { task, types } from "hardhat/config";

import { readAddressList } from "../../scripts/contractAddress";
import { VoteEscrowedFurion, VoteEscrowedFurion__factory } from "../../typechain";

// setter tasks
task("veFUR:initialize", "Initialize FUR Reward Token veFUR Staking").setAction(async (TaskArguments, hre) => {
  console.log("Initializing the FUR reward token");

  const { network } = hre;
  const addresses = readAddressList();

  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const veFURTokenAddress = addresses[_network].VoteEscrowedFurion;
  const furionTokenAddress = addresses[_network].FurionToken;

  const veFURToken: VoteEscrowedFurion__factory = await hre.ethers.getContractFactory("VoteEscrowedFurion");
  const veFUR: VoteEscrowedFurion = veFURToken.attach(veFURTokenAddress);

  const result = await veFUR.initialize(furionTokenAddress);
  await result.wait();

  const addr = await veFUR.furion();
  if (addr == furionTokenAddress) {
    console.log("FUR Reward token initialized");
  } else {
    console.log("Error initializing FUR Reward token");
    return;
  }

  console.log("Task veFUR:initialize ended successfully");
});

task("veFUR:addWhiteList", "Whitelist an address veFUR Staking")
  .addParam("address", "The Whitelist address to be added", null, types.string)
  .setAction(async (TaskArguments, hre) => {
    const address = TaskArguments.address;
    console.log("Whitelisting address ", address);
    const { network } = hre;
    const addresses = readAddressList();

    const _network = network.name == "hardhat" ? "localhost" : network.name;
    const veFURTokenAddress = addresses[_network].VoteEscrowedFurion;

    const veFURToken: VoteEscrowedFurion__factory = await hre.ethers.getContractFactory("VoteEscrowedFurion");
    const veFUR: VoteEscrowedFurion = veFURToken.attach(veFURTokenAddress);

    const tx = await veFUR.addWhitelist(address);
    await tx.wait();

    const status = await veFUR.whitelist(address);
    if (status == true) {
      console.log("Whitelist added");
    } else {
      console.log("Error adding whitelisted");
      return;
    }
    console.log("Task veFUR:addWhiteList ended successfully");
  });

task("veFUR:removeWhiteList", "Removing an address from whitelist veFUR Staking")
  .addParam("address", "The Whitelisted address to be removed", null, types.string)
  .setAction(async (TaskArguments, hre) => {
    const address = TaskArguments.address;
    console.log("Removing an address from whitelist ", address);
    const { network } = hre;
    const addresses = readAddressList();

    const _network = network.name == "hardhat" ? "localhost" : network.name;
    const veFURTokenAddress = addresses[_network].VoteEscrowedFurion;

    const veFURToken: VoteEscrowedFurion__factory = await hre.ethers.getContractFactory("VoteEscrowedFurion");
    const veFUR: VoteEscrowedFurion = veFURToken.attach(veFURTokenAddress);

    const tx = await veFUR.removeWhitelist(address);
    await tx.wait();

    const status = await veFUR.whitelist(address);
    if (status == false) {
      console.log("Address removed from whitelist");
    } else {
      console.log("Error removing an address from whitelist");
      return;
    }

    console.log("Task veFUR:removeWhiteList ended successfully");
  });

task("veFUR:setMaxCapRatio", "Set Max Cap Ratio veFUR Staking")
  .addParam("ratio", "The maximum cap ratio value", null, types.string)
  .setAction(async (TaskArguments, hre) => {
    console.log("Setting Max Cap Ratio");
    const ratio = TaskArguments.ratio;
    const { network } = hre;
    const addresses = readAddressList();

    const _network = network.name == "hardhat" ? "localhost" : network.name;
    const veFURTokenAddress = addresses[_network].VoteEscrowedFurion;

    const veFURToken: VoteEscrowedFurion__factory = await hre.ethers.getContractFactory("VoteEscrowedFurion");
    const veFUR: VoteEscrowedFurion = veFURToken.attach(veFURTokenAddress);

    const tx = await veFUR.setMaxCapRatio(parseUnits(ratio));
    await tx.wait();

    const capRatio = await veFUR.maxCapRatio();
    if (formatUnits(capRatio) == ratio) {
      console.log("Max Cap Ratio setup completed");
    } else {
      console.log("Error setting up Max Cap Ratio");
      return;
    }

    console.log("Task veFUR:setMaxCapRatio ended successfully");
  });

task("veFUR:setGenerationRate", "Set Generation Rate veFUR Staking")
  .addParam("rate", "The generation rate value", null, types.string)
  .setAction(async (TaskArguments, hre) => {
    console.log("Setting Generation Rate");
    const rate = TaskArguments.rate;
    const { network } = hre;
    const addresses = readAddressList();

    const _network = network.name == "hardhat" ? "localhost" : network.name;
    const veFURTokenAddress = addresses[_network].VoteEscrowedFurion;

    const veFURToken: VoteEscrowedFurion__factory = await hre.ethers.getContractFactory("VoteEscrowedFurion");
    const veFUR: VoteEscrowedFurion = veFURToken.attach(veFURTokenAddress);

    const tx = await veFUR.setGenerationRate(parseUnits(rate));
    await tx.wait();

    const generationRate = await veFUR.generationRate();
    if (formatUnits(generationRate) == rate) {
      console.log("Generation Rate setup complete");
    } else {
      console.log("Error setting up Generation rate");
      return;
    }

    console.log("Task veFUR:setGenerationRate ended successfully");
  });

task("veFUR:pause", "Pause veFUR Staking").setAction(async (TaskArguments, hre) => {
  console.log("Pause veFUR contract functionalities");
  const { network } = hre;
  const addresses = readAddressList();

  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const veFURTokenAddress = addresses[_network].VoteEscrowedFurion;

  const veFURToken: VoteEscrowedFurion__factory = await hre.ethers.getContractFactory("VoteEscrowedFurion");
  const veFUR: VoteEscrowedFurion = veFURToken.attach(veFURTokenAddress);

  const tx = await veFUR.pause();
  await tx.wait();

  console.log("Task veFUR:pause ended successfully");
});

task("veFUR:unpause", "Unpause veFUR Staking").setAction(async (TaskArguments, hre) => {
  console.log("Resuming veFUR contract functionalities");
  const { network } = hre;
  const addresses = readAddressList();

  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const veFURTokenAddress = addresses[_network].VoteEscrowedFurion;

  const veFURToken: VoteEscrowedFurion__factory = await hre.ethers.getContractFactory("VoteEscrowedFurion");
  const veFUR: VoteEscrowedFurion = veFURToken.attach(veFURTokenAddress);

  const tx = await veFUR.unpause();
  await tx.wait();

  console.log("Task veFUR:unpause ended successfully");
});

// getter tasks
task("veFUR:rewardToken", "Get reward token address veFUR Staking").setAction(async function (taskArguments, hre) {
  console.log("Reading the reward token address");

  const { network } = hre;
  const addresses = readAddressList();

  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const veFURTokenAddress = addresses[_network].VoteEscrowedFurion;

  const veFURToken: VoteEscrowedFurion__factory = await hre.ethers.getContractFactory("VoteEscrowedFurion");
  const veFUR: VoteEscrowedFurion = veFURToken.attach(veFURTokenAddress);

  const result = await veFUR.furion();

  console.log("The Reward Token: ", result);
  console.log("Task veFUR:rewardToken ended successfully");
});

task("veFUR:userInfo", "Get userinfo veFUR Staking")
  .addParam("address", "User Address", null, types.string)
  .setAction(async (TaskArguments, hre) => {
    const address = TaskArguments.address;
    console.log("Reading the userinfo for the address ", address);

    const { network } = hre;
    const addresses = readAddressList();

    const _network = network.name == "hardhat" ? "localhost" : network.name;
    const veFURTokenAddress = addresses[_network].VoteEscrowedFurion;

    const veFURToken: VoteEscrowedFurion__factory = await hre.ethers.getContractFactory("VoteEscrowedFurion");
    const veFUR: VoteEscrowedFurion = veFURToken.attach(veFURTokenAddress);

    const result = await veFUR.users(address);

    console.log("The UserInfo ", result.toString());
    console.log("Task veFUR:userInfo ended successfully");
  });

task("veFUR:maxCapRatio", "Get max cap ratio veFUR Staking").setAction(async (TaskArguments, hre) => {
  console.log("Reading the max cap ratio");

  const { network } = hre;
  const addresses = readAddressList();

  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const veFURTokenAddress = addresses[_network].VoteEscrowedFurion;

  const veFURToken: VoteEscrowedFurion__factory = await hre.ethers.getContractFactory("VoteEscrowedFurion");
  const veFUR: VoteEscrowedFurion = veFURToken.attach(veFURTokenAddress);

  const result = await veFUR.maxCapRatio();

  console.log("The Max Cap Ratio ", formatUnits(result));
  console.log("Task veFUR:maxCapRatio ended successfully");
});

task("veFUR:generationRate", "Get generation rate veFUR Staking").setAction(async (TaskArguments, hre) => {
  console.log("Reading the generation rate");

  const { network } = hre;
  const addresses = readAddressList();

  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const veFURTokenAddress = addresses[_network].VoteEscrowedFurion;

  const veFURToken: VoteEscrowedFurion__factory = await hre.ethers.getContractFactory("VoteEscrowedFurion");
  const veFUR: VoteEscrowedFurion = veFURToken.attach(veFURTokenAddress);

  const result = await veFUR.generationRate();

  console.log("The Generation Rate ", formatUnits(result));
  console.log("Task veFUR:generationRate ended successfully");
});

task("veFUR:whitelistStatus", "Get whitelist status veFUR Staking")
  .addParam("address", "User Address", null, types.string)
  .setAction(async (TaskArguments, hre) => {
    const address = TaskArguments.address;
    console.log("Reading whitelist status of ", address);

    const { network } = hre;
    const addresses = readAddressList();

    const _network = network.name == "hardhat" ? "localhost" : network.name;
    const veFURTokenAddress = addresses[_network].VoteEscrowedFurion;

    const veFURToken: VoteEscrowedFurion__factory = await hre.ethers.getContractFactory("VoteEscrowedFurion");
    const veFUR: VoteEscrowedFurion = veFURToken.attach(veFURTokenAddress);

    const result = await veFUR.whitelist(address);

    console.log("The status ", result);
    console.log("Task veFUR:whitelistStatus ended successfully");
  });
