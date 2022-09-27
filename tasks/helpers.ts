import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { Contract, ContractFactory } from "ethers";

import {
  readAddressList,
  readArgs,
  readMarketList,
  storeAddressList,
  storeArgs,
  storeMarketList,
} from "../scripts/contractAddress";

export const getNetwork = () => {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  return _network;
};

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

export const writeMarketDeployment = (network: string, _name: string, _address: string, implementation: string) => {
  const marketList = readMarketList();
  const counter = marketList[network]["counter"];
  marketList[network][counter] = { name: _name, address: _address };
  marketList[network]["counter"]++;
  storeMarketList(marketList);

  const argsList = readArgs();
  argsList[network][_name] = { address: implementation, args: [] };
  storeArgs(argsList);
};

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
