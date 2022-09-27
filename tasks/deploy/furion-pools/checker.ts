import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { deploy, getNetwork, writeDeployment } from "../../helpers";

task("deploy:Checker", "Deploy checker contract").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const network = getNetwork();

  const checker = await deploy(ethers, "Checker", []);

  console.log();
  console.log(`Checker deployed to: ${checker.address} on ${network}`);

  writeDeployment(network, "Checker", checker.address, []);
});
