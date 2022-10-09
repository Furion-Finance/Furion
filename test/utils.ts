import { BigNumber, Contract, ContractFactory } from "ethers";

// import { ethers } from "hardhat";

const hre = require("hardhat");
const ethers = hre.ethers;
const upgrades = hre.upgrades;

export const deploy = async (contractName: string, params: Array<any>) => {
  const signers = await ethers.getSigners();

  const factory: ContractFactory = await ethers.getContractFactory(contractName);
  let contract: Contract;

  if (params.length > 0) contract = await factory.connect(signers[0]).deploy(...params);
  else contract = await factory.connect(signers[0]).deploy();

  return await contract.deployed();
};

export const deployUpgradeable = async (contractName: string, params: Array<any>) => {
  const signers = await ethers.getSigners();
  const factory: ContractFactory = await ethers.getContractFactory(contractName);
  const contract: Contract = await upgrades.deployProxy(factory, params);

  return await contract.deployed();
};

export const toWei = (etherAmount: string) => {
  return ethers.utils.parseUnits(etherAmount);
};

export const formatTokenAmount = (amount: string) => {
  return ethers.utils.formatUnits(amount, 18);
};

export const stablecoinToWei = (stablecoinAmount: string) => {
  return ethers.utils.parseUnits(stablecoinAmount, 6);
};

export const formatStablecoin = (stablecoinAmount: string | BigNumber) => {
  return ethers.utils.formatUnits(stablecoinAmount, 6);
};

export const zeroAddress = () => {
  return ethers.constants.AddressZero;
};

export const getLatestBlockNumber = async (provider: any) => {
  const blockNumber = await provider.getBlockNumber();
  return blockNumber;
};

export const getLatestBlockTimestamp = async (provider: any) => {
  const blockNumBefore = await provider.getBlockNumber();
  const blockBefore = await provider.getBlock(blockNumBefore);
  return blockBefore.timestamp;
};

export const mineBlocks = async (blockNumber: number) => {
  await hre.network.provider.send("hardhat_mine", [ethers.utils.hexValue(blockNumber)]);
};

// Get the current timestamp in seconds
export const getNow = () => {
  const time = new Date().getTime();
  const now = Math.floor(time / 1000);
  return now;
};

export const toBN = (normalNumber: number) => {
  return ethers.BigNumber.from(normalNumber);
};

export const customErrorMsg = (msg: string) => {
  return "custom error " + msg;
};
