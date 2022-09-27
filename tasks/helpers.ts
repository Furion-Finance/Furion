import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { Contract, ContractFactory } from "ethers";

import {
  readAddressList,
  readAggregatePoolList,
  readArgs,
  readFarmingPoolList,
  readFurionSwapList,
  readMarketList,
  readSeparatePoolList,
  storeAddressList,
  storeAggregatePoolList,
  storeArgs,
  storeFarmingPoolList,
  storeFurionSwapList,
  storeMarketList,
  storeSeparatePoolList,
} from "../scripts/contractAddress";

export const getNetwork = () => {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  return _network;
};

/********************************* Store addresses & args *************************************/

export const writeDeployment = (network: string, name: string, _address: string, _args: Array<any>) => {
  const addressList = readAddressList();
  addressList[network][name] = _address;
  storeAddressList(addressList);

  const argsList = readArgs();
  argsList[network][name] = { address: _address, args: _args };
  storeArgs(argsList);
};

export const writeUpgradeableDeployment = (network: string, name: string, _address: string, implementation: string) => {
  const addressList = readAddressList();
  addressList[network][name] = _address;
  storeAddressList(addressList);

  const argsList = readArgs();
  argsList[network][name] = { address: implementation, args: [] };
  storeArgs(argsList);
};

export const writeSeparatePool = (network: string, _name: string, _address: string, _args: Array<any>) => {
  const spList = readSeparatePoolList();
  spList[network].push({ name: _name, address: _address });
  storeSeparatePoolList(spList);

  const argsList = readArgs();
  const finalName = _name + " Separate Pool";
  argsList[network][finalName] = { address: _address, args: _args };
  storeArgs(argsList);
};

export const writeAggregatePool = (network: string, _name: string, _address: string, _args: Array<any>) => {
  const apList = readAggregatePoolList();
  apList[network].push({ name: _name, address: _address });
  storeAggregatePoolList(apList);

  const argsList = readArgs();
  const finalName = _name + " Aggregate Pool";
  argsList[network][finalName] = { address: _address, args: _args };
  storeArgs(argsList);
};

export const writeMarketDeployment = (network: string, _name: string, _address: string, implementation: string) => {
  const marketList = readMarketList();
  marketList[network].push({ name: _name, address: _address });
  storeMarketList(marketList);

  const argsList = readArgs();
  argsList[network][_name] = { address: implementation, args: [] };
  storeArgs(argsList);
};

export const writeFarmingPool = (network: string, poolObject: object) => {
  const fpList = readFarmingPoolList();
  fpList[network][poolObject.poolId] = poolObject;
  storeFarmingPoolList(fpList);
};

export const writeSwap = (network: string, pairObject: object) => {
  const swapList = readFurionSwapList();
  swapList[network].push(pairObject);
  storeFurionSwapList(swapList);

  const argsList = readArgs();
  const finalName = `${pairObject.name0}-${pairObject.name1} Swap Pair`;
  argsList[network][finalName] = { address: pairObject.pair, args: [] };
  storeArgs(argsList);
};

/**************************************** Deployment ****************************************/

export const deploy = async (ethers: HardhatEthersHelpers, artifact: string, params: Array<any>) => {
  const signers: SignerWithAddress[] = await ethers.getSigners();

  const factory: ContractFactory = <ContractFactory>await ethers.getContractFactory(artifact);
  let contract: Contract;

  if (params.length > 0) contract = await factory.connect(signers[0]).deploy(...params);
  else contract = await factory.connect(signers[0]).deploy();

  return await contract.deployed();
};

export const deployUpgradeable = async (
  ethers: HardhatEthersHelpers,
  upgrades: any,
  artifact: string,
  params: Array<any>,
) => {
  const factory: ContractFactory = <ContractFactory>await ethers.getContractFactory(artifact);
  let contract: Contract = await upgrades.deployProxy(factory, params);

  return await contract.deployed();
};

export const upgrade = async (ethers: HardhatEthersHelpers, upgrades: any, artifact: string, address: string) => {
  const factory: ContractFactory = <ContractFactory>await ethers.getContractFactory(artifact);
  let contract: Contract = await upgrades.upgradeProxy(address, factory);
};
