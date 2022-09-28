import { DeployFunction, ProxyOptions } from "hardhat-deploy/types";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../../scripts/contractAddress";
import { deployUpgradeable, getNetwork, writeUpgradeableDeployment } from "../../helpers";

task("deploy:FurionFarming", "Deploy FurionFarming contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers, upgrades },
) {
  const hre = require("hardhat");
  const network = getNetwork();
  const addressList = readAddressList();

  const fur = await ethers.getContractAt("FurionToken", addressList[network].FurionToken);

  const farmingPoolUpgradeable = await deployUpgradeable(ethers, upgrades, "FarmingPoolUpgradeable", [fur.address]);

  console.log();
  console.log(`FurionFarmingPool deployed to: ${farmingPoolUpgradeable.address} on ${network}`);

  const implementation = await upgrades.erc1967.getImplementationAddress(farmingPoolUpgradeable.address);
  writeUpgradeableDeployment(network, "FarmingPoolUpgradeable", farmingPoolUpgradeable.address, implementation);

  await farmingPoolUpgradeable.deployTransaction.wait(4);
  await hre.run("addFarmingMinter");
});

/*task("deploy:FurionFarming", "Deploy FurionFarming contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers, upgrades },
) {
  const hre = require("hardhat");

  const { deployments, getNamedAccounts } = hre;
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const network = getNetwork();
  const addressList = readAddressList();
  const argsList = readArgs();

  const furion = await ethers.getContractAt("FurionToken", addressList[network].FurionToken);

  // Always use the same proxy admin
  const proxyOptions: ProxyOptions = {
    proxyContract: "TransparentUpgradeableProxy",
    viaAdminContract: { name: "ProxyAdmin", artifact: "ProxyAdmin" },
    execute: {
      init: {
        methodName: "initialize",
        args: [furion.address],
      },
    },
  };

  const farmingPoolUpgradeable = await deploy("FarmingPoolUpgradeable", {
    contract: "FarmingPoolUpgradeable",
    from: deployer,
    proxy: proxyOptions,
    args: [],
    log: true,
  });

  console.log();
  console.log(`FurionFarmingPool deployed to: ${farmingPoolUpgradeable.address} on ${network}`);

  addressList[network].FarmingPoolUpgradeable = farmingPoolUpgradeable.address;
  storeAddressList(addressList);
  argsList[network].FarmingPoolUpgradeable = {
    address: farmingPoolUpgradeable.address,
    args: []
  }
  storeArgs(argsList);

  await hre.run("addFarmingMinter");
});
*/
