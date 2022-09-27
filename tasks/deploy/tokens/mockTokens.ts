import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { deploy, getNetwork, writeDeployment } from "../../helpers";

task("deploy:MockToken", "Deploy mock token contracts").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const network = getNetwork();

  // ******************************* Deploy & Verify MockUSD ******************************** //
  const mockUSD = await deploy(ethers, "MockUSD", []);

  console.log();
  console.log(`Mock USD deployed to: ${mockUSD.address} on ${_network}`);

  writeDeployment(network, "MockUSD", mockUSD.address, []);

  // ******************************* Deploy & Verify WETH ******************************** //
  const weth = await deploy(ethers, "WETH9", []);

  console.log();
  console.log(`Mock WETH deployed to: ${weth.address} on ${_network}`);

  writeDeployment(network, "WETH", weth.address, []);
});
