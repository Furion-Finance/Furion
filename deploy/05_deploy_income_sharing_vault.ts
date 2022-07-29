import { DeployFunction, ProxyOptions } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { readAddressList, storeAddressList } from "../scripts/contractAddress";

// Deploy IncomeSharingVault
// It is a proxy deployment
//    - TransparentUpgradeableProxy
//    - IncomeSharingVault
// Tags:
//    - IncomeSharing

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, get } = deployments;

  network.name = network.name == "hardhat" ? "localhost" : network.name;

  const { deployer } = await getNamedAccounts();

  // Read address list from local file
  const addressList = readAddressList();

  const veFUR = await get("VeFUR");

  // const proxyArtifact = await getArtifact("TransparentUpgradeableProxy");
  // Always use the same proxy admin
  const proxyOptions: ProxyOptions = {
    proxyContract: "TransparentUpgradeableProxy",
    viaAdminContract: { name: "ProxyAdmin", artifact: "ProxyAdmin" },
    execute: {
      init: {
        methodName: "initialize",
        args: [veFUR.address],
      },
    },
  };
  const incomeSharingVault = await deploy("IncomeSharingVault", {
    contract: "IncomeSharingVault",
    from: deployer,
    proxy: proxyOptions,
    args: [],
    log: true,
  });

  addressList[network.name].IncomeSharingVault = incomeSharingVault.address;

  // Store the address list after deployment
  storeAddressList(addressList);

  // Run some afterwards tasks
  // await hre.run("setIncomeSharingInCore");

  // await hre.run("updateLastRewardBalance");
};

func.tags = ["IncomeSharing"];
export default func;
