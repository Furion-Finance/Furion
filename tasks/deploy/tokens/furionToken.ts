import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { deploy, getNetwork, writeDeployment } from "../../helpers";

task("deploy:FurionToken", "Deploy furion token contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const network = getNetwork();

  const furion = await deploy(ethers, "FurionToken", []);

  console.log();
  console.log(`Furion token deployed to: ${furion.address} on ${network}`);

  writeDeployment(network, "FurionToken", furion.address, []);
});
