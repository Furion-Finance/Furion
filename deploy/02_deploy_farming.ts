import { DeployFunction, ProxyOptions } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { readAddressList, storeAddressList } from "../scripts/contractAddress";

// Deploy Farming Pool
// It is a proxy deployment
//    - TransparentUpgradeableProxy
//    - FarmingPoolUpgradeable
// Tasks:
//    - Add Furion minter role to FarmingPoolUpgradeable
// Tags:
//    - Farming

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, get } = deployments;

  network.name = network.name == "hardhat" ? "localhost" : network.name;

  const { deployer } = await getNamedAccounts();

  // Read address list from local file
  const addressList = readAddressList();

  const furion = await get("FurionToken");

  console.log("FurionToken address: ", furion.address);

  // const proxyArtifact = await getArtifact("TransparentUpgradeableProxy");
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
  addressList[network.name].FarmingPoolUpgradeable = farmingPoolUpgradeable.address;

  // Store the address list after deployment
  storeAddressList(addressList);
};

func.tags = ["Farming"];
export default func;
