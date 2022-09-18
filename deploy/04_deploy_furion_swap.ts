import { DeployFunction, ProxyOptions } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { readAddressList, storeAddressList } from "../scripts/contractAddress";

// Deploy Furion Swap
// It is a non-proxy deployment
// Contract:
//    - FurionSwapFactory
//    - FurionSwapV2Router
// Tasks:
//    - Add new FurionSwapPair
// Tags:
//    - FurionSwap

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, get } = deployments;

  network.name = network.name == "hardhat" ? "localhost" : network.name;

  const { deployer } = await getNamedAccounts();

  // Read address list from local file
  const addressList = readAddressList();

  const weth = await get("WETH");

  // Factory
  const factory = await deploy("FurionSwapFactory", {
    contract: "FurionSwapFactory",
    from: deployer,
    args: [deployer],
    log: true,
  });
  addressList[network.name].FurionSwapFactory = factory.address;

  // Router
  const router = await deploy("FurionSwapV2Router", {
    contract: "FurionSwapV2Router",
    from: deployer,
    args: [factory.address, weth.address],
    log: true,
  });
  addressList[network.name].FurionSwapV2Router = router.address;

  // Store the address list after deployment
  storeAddressList(addressList);

  // Run some afterwards tasks
  // await hre.run("setFurionSwapFactory");
  // await hre.run("setFurionSwapV2Router");
};

func.tags = ["FurionSwap"];
export default func;
