import "@nomiclabs/hardhat-ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { task, types } from "hardhat/config";

import { readAddressList } from "../../scripts/contractAddress";
import { FurionToken__factory, IncomeMaker, IncomeMaker__factory } from "../../typechain";
import { getNetwork } from "../helpers";

// tasks
// 1. initialize
// 2. collectSwapIncome
// 3. emergencyWithdraw
// 4. setIncomeToken
// 5. setIncomeProportion

// 6. incomeToken
// 7. incomeProportion

// tasks modifying the state of the contract
task("IncomeMaker:initialize", "Initialize Income Maker")
  .addParam("incomeToken", "Address of an income token", null, types.string)
  .addParam("furionSwapFactory", "Address of the Furion Swap Factory", null, types.string)
  .addParam("furionSwapRouter", "Address of the Furion Swap Router", null, types.string)
  .addParam("incomeSharingVault", "Address of the income sharing vault", null, types.string)
  .setAction(async (TaskArguments, hre) => {
    const _incomeToken = TaskArguments.incomeToken;
    const _factory = TaskArguments.furionSwapFactory;
    const _router = TaskArguments.furionSwapRouter;
    const _incomeSharingVault = TaskArguments.incomeSharingVault;

    const network = getNetwork();
    const addresses = readAddressList();

    const incomeMakerFactory: IncomeMaker__factory = await hre.ethers.getContractFactory("IncomeMaker");
    const incomeMaker: IncomeMaker = incomeMakerFactory.attach(addresses[network].IncomeMaker);

    const tx = await incomeMaker.initialize(_incomeToken, _router, _factory, _incomeSharingVault);
    await tx.wait();

    console.log("Task IncomeMaker:initialize ended successfully");
  });

task("IncomeMaker:collectSwapIncome", "Collect income from FurionSwap to income sharing vault Income Maker")
  .addParam("token0", "Address of token0 from FurionSwap pair", null, types.string)
  .addParam("token1", "Address of token1 from FurionSwap pair", null, types.string)
  .setAction(async (taskArgs, { ethers }) => {
    console.log("\nCollect income from FurionSwap to income sharing vault...\n");

    const token0 = taskArgs.token0;
    const token1 = taskArgs.token1;
    const hre = require("hardhat");

    const network = getNetwork();
    const [dev] = await hre.ethers.getSigners();
    console.log("The default signer is: ", dev.address);

    const addressList = readAddressList();

    // Income maker contract
    const maker = new IncomeMaker__factory(dev).attach(addressList[network].IncomeMaker);

    const furion = new FurionToken__factory(dev).attach(addressList[network].FurionToken);

    const balBefore = await furion.balanceOf(addressList[network].IncomeSharingVault);
    console.log("Income sharing vault bal before: ", formatUnits(balBefore, 18));

    const tx = await maker.collectIncomeFromSwap(token0, token1);
    console.log("Tx details: ", await tx.wait());

    const balAfter = await furion.balanceOf(addressList[network].IncomeSharingVault);
    console.log("Income sharing vault bal after: ", formatUnits(balAfter, 18));

    console.log("Task IncomeMaker:collectSwapIncome ended successfully");
  });

task("IncomeMaker:emergencyWithdraw", "Emergency Withdraw Income Maker")
  .addParam("tokenAddress", "Address of the token", null, types.string)
  .addParam("tokenAmount", "Amount of the token", null, types.string)
  .setAction(async (TaskArguments, hre) => {
    const _tokenAddress = TaskArguments.tokenAddress;
    const _tokenAmount = TaskArguments.tokenAmount;

    const network = getNetwork();
    const addresses = readAddressList();

    const incomeMakerFactory: IncomeMaker__factory = await hre.ethers.getContractFactory("IncomeMaker");
    const incomeMaker: IncomeMaker = incomeMakerFactory.attach(addresses[network].IncomeMaker);

    const tx = await incomeMaker.emergencyWithdraw(_tokenAddress, _tokenAmount);
    await tx.wait();

    console.log("Task IncomeMaker:emergencyWithdraw ended successfully");
  });

task("IncomeMaker:setIncomeToken", "Set New Income Token Income Maker")
  .addParam("tokenAddress", "Address of the token", null, types.string)
  .setAction(async (TaskArguments, hre) => {
    const _tokenAddress = TaskArguments.tokenAddress;

    const network = getNetwork();
    const addresses = readAddressList();

    const incomeMakerFactory: IncomeMaker__factory = await hre.ethers.getContractFactory("IncomeMaker");
    const incomeMaker: IncomeMaker = incomeMakerFactory.attach(addresses[network].IncomeMaker);

    const tx = await incomeMaker.setIncomeToken(_tokenAddress);
    await tx.wait();

    console.log("Task IncomeMaker:setIncomeToken ended successfully");
  });

task("IncomeMaker:setIncomeProportion", "Set New Income Proportion Income Maker")
  .addParam("proportionValue", "Value of the proportion", null, types.string)
  .setAction(async (TaskArguments, hre) => {
    const _value = parseUnits(TaskArguments.proportionValue);

    const network = getNetwork();
    const addresses = readAddressList();

    const incomeMakerFactory: IncomeMaker__factory = await hre.ethers.getContractFactory("IncomeMaker");
    const incomeMaker: IncomeMaker = incomeMakerFactory.attach(addresses[network].IncomeMaker);

    const tx = await incomeMaker.setIncomeProportion(_value);
    await tx.wait();

    console.log("Task IncomeMaker:setIncomeProportion ended successfully");
  });

// tasks reading state of the contract
task("IncomeMaker:incomeToken", "Income Token Income Maker").setAction(async (TaskArguments, hre) => {
  console.log("Reading the Income Token address from Income Maker contract");

  const network = getNetwork();
  const addresses = readAddressList();

  const incomeMakerFactory: IncomeMaker__factory = await hre.ethers.getContractFactory("IncomeMaker");
  const incomeMaker: IncomeMaker = incomeMakerFactory.attach(addresses[network].IncomeMaker);

  const token = await incomeMaker.incomeToken();
  console.log("Income Token: ", token);

  console.log("Task IncomeMaker:incomeToken ended successfully");
});

task("IncomeMaker:factory", "factory Income Maker").setAction(async (TaskArguments, hre) => {
  console.log("Reading the Income Token address from Income Maker contract");

  const network = getNetwork();
  const addresses = readAddressList();

  const incomeMakerFactory: IncomeMaker__factory = await hre.ethers.getContractFactory("IncomeMaker");
  const incomeMaker: IncomeMaker = incomeMakerFactory.attach(addresses[network].IncomeMaker);

  const factory = await incomeMaker.factory();
  console.log("IncomeMaker factory: ", factory);

  console.log("Task IncomeMaker:factory ended successfully");
});

task("IncomeMaker:router", "router Income Maker").setAction(async (TaskArguments, hre) => {
  console.log("Reading the router address from Income Maker contract");

  const network = getNetwork();
  const addresses = readAddressList();

  const incomeMakerFactory: IncomeMaker__factory = await hre.ethers.getContractFactory("IncomeMaker");
  const incomeMaker: IncomeMaker = incomeMakerFactory.attach(addresses[network].IncomeMaker);

  const factory = await incomeMaker.router();
  console.log("IncomeMaker router: ", factory);

  console.log("Task IncomeMaker:router ended successfully");
});

task("IncomeMaker:incomeSharingVault", "income sharing vault Income Maker").setAction(async (TaskArguments, hre) => {
  console.log("Reading the income sharing vault address from Income Maker contract");

  const network = getNetwork();
  const addresses = readAddressList();

  const incomeMakerFactory: IncomeMaker__factory = await hre.ethers.getContractFactory("IncomeMaker");
  const incomeMaker: IncomeMaker = incomeMakerFactory.attach(addresses[network].IncomeMaker);

  const factory = await incomeMaker.incomeSharingVault();
  console.log("IncomeMaker income sharing vault: ", factory);

  console.log("Task IncomeMaker:incomeSharingVault ended successfully");
});

// tasks reading state of the contract
task("IncomeMaker:incomeToken", "Income Token Income Maker").setAction(async (TaskArguments, hre) => {
  console.log("Reading the Income Token address from Income Maker contract");

  const network = getNetwork();
  const addresses = readAddressList();

  const incomeMakerFactory: IncomeMaker__factory = await hre.ethers.getContractFactory("IncomeMaker");
  const incomeMaker: IncomeMaker = incomeMakerFactory.attach(addresses[network].IncomeMaker);

  const token = await incomeMaker.incomeToken();
  console.log("Income Token: ", token);

  console.log("Task IncomeMaker:incomeToken ended successfully");
});

task("IncomeMaker:incomeProportion", "Income Proportion Income Maker").setAction(async (TaskArguments, hre) => {
  console.log("Reading the Income Proportion from Income Maker contract");

  const network = getNetwork();
  const addresses = readAddressList();

  const incomeMakerFactory: IncomeMaker__factory = await hre.ethers.getContractFactory("IncomeMaker");
  const incomeMaker: IncomeMaker = incomeMakerFactory.attach(addresses[network].IncomeMaker);

  const value = await incomeMaker.incomeProportion();
  console.log("Income Token: ", formatUnits(value));

  console.log("Task IncomeMaker:incomeProportion ended successfully");
});

task("IncomeMaker:tokenBalance", "Income Maker contract token balance")
  .addParam("token", "address of the token", null, types.string)
  .setAction(async (TaskArguments, hre) => {
    console.log("Reading token balance");
    const network = getNetwork();
    const addresses = readAddressList();

    const incomeMakerFactory: IncomeMaker__factory = await hre.ethers.getContractFactory("IncomeMaker");
    const incomeMaker: IncomeMaker = incomeMakerFactory.attach(addresses[network].IncomeMaker);

    const value = await incomeMaker.incomeProportion();
    console.log("Income Token: ", formatUnits(value));

    console.log("Task IncomeMaker:tokenBalance ended successfully");
  });
