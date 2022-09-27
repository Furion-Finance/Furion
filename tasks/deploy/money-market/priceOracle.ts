import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { deploy, getNetwork, writeDeployment } from "../../helpers";

task("deploy:PriceOracle", "Deploy price oracle contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const network = getNetwork();

  const po = await deploy(ethers, "SimplePriceOracle", []);

  console.log();
  console.log(`Price oracle deployed to: ${po.address} on ${network}`);

  writeDeployment(network, "PriceOracle", po.address, []);
});
