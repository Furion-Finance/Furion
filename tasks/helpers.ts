import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { Contract, ContractFactory } from "ethers";

export const deploy = async (ethers: HardhatEthersHelpers, artifact: string, ...params: Array<any>) => {
  const signers: SignerWithAddress[] = await ethers.getSigners();

  const factory: ContractFactory = <ContractFactory>await ethers.getContractFactory(artifact);
  let contract: Contract;

  if (params) contract = await factory.connect(signers[0]).deploy(...params);
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
