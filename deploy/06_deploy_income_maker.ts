import { DeployFunction, ProxyOptions } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { readAddressList, storeAddressList } from "../scripts/contractAddress";

// Deploy IncomeMaker
// It is a proxy deployment
//    - TransparentUpgradeableProxy
//    - IncomeMaker
// Tags:
//    - IncomeMaker

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, get } = deployments;

  network.name = network.name == "hardhat" ? "localhost" : network.name;

  const { deployer } = await getNamedAccounts();

  // Read address list from local file
  const addressList = readAddressList();

  const router = await get("FurionSwapV2Router");
  const factory = await get("FurionSwapFactory");
  const vault = await get("IncomeSharingVault");

  const furion = await get("FurionToken");

  // const proxyArtifact = await getArtifact("TransparentUpgradeableProxy");
  // Always use the same proxy admin
  const proxyOptions: ProxyOptions = {
    proxyContract: "TransparentUpgradeableProxy",
    viaAdminContract: { name: "ProxyAdmin", artifact: "ProxyAdmin" },
    execute: {
      init: {
        methodName: "initialize",
        args: [furion.address, router.address, factory.address, vault.address],
      },
    },
  };
  const incomeMaker = await deploy("IncomeMaker", {
    contract: "IncomeMaker",
    from: deployer,
    proxy: proxyOptions,
    args: [],
    log: true,
  });

  addressList[network.name].IncomeMaker = incomeMaker.address;

  // Store the address list after deployment
  storeAddressList(addressList);

  // Run some afterwards tasks
  // await hre.run("setIncomeMakerInFactory");
};

func.tags = ["IncomeMaker"];
export default func;
