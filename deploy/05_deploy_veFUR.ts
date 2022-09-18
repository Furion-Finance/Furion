import { DeployFunction, ProxyOptions } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { readAddressList, storeAddressList } from "../scripts/contractAddress";

// Deploy veFUR
// It is a proxy deployment
//    - TransparentUpgradeableProxy
//    - VoteEscrowedFurion
// Tags:
//    - VeFUR

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  network.name = network.name == "hardhat" ? "localhost" : network.name;

  const { deployer } = await getNamedAccounts();

  // Read address list from local file
  const addressList = readAddressList();

  // Arguments for deployment
  const furionAddress: string = addressList[network.name].FurionToken;

  const argsConfig = [furionAddress];

  // Always use the same proxy admin
  const proxyOptions: ProxyOptions = {
    proxyContract: "TransparentUpgradeableProxy",
    viaAdminContract: { name: "ProxyAdmin", artifact: "ProxyAdmin" },
    execute: {
      init: {
        methodName: "initialize",
        args: argsConfig,
      },
    },
  };

  const veFUR = await deploy("VeFUR", {
    contract: "VoteEscrowedFurion",
    from: deployer,
    proxy: proxyOptions,
    args: [],
    log: true,
  });
  addressList[network.name].VoteEscrowedFurion = veFUR.address;

  // Store the address list after deployment
  storeAddressList(addressList);
};

func.tags = ["VeFUR"];
export default func;
