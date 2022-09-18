import { DeployFunction, ProxyOptions } from "hardhat-deploy/types";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";

task("deploy:FurionFarming", "Deploy FurionFarming contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers, upgrades },
) {
  const hre = require("hardhat");

  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addressList = readAddressList();

  const furion = await ethers.getContractAt("FurionToken", addressList[_network].FurionToken);

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
  console.log(`FurionFarmingPool deployed to: ${farmingPoolUpgradeable.address} on ${_network}`);

  addressList[_network].FarmingPoolUpgradeable = farmingPoolUpgradeable.address;
  storeAddressList(addressList);

  if (_network != "localhost") {
    const implementation = await upgrades.erc1967.getImplementationAddress(farmingPoolUpgradeable.address);
    try {
      console.log("Waiting confirmations before verifying...");
      //   await farmingPoolUpgradeable.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: implementation,
      });
    } catch (e: any) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${implementation}`);
      }
    }
  }

  await hre.run("addFarmingMinter");
});
