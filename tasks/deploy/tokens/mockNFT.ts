import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../../scripts/contractAddress";
import { deploy, getNetwork, writeDeployment } from "../../helpers";

task("deploy:MockCoolCats", "Deploy mock CoolCats").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const network = getNetwork();
  const addressList = readAddressList();

  const coolCats = await deploy(ethers, "CoolCats", []);

  console.log();
  console.log(`CoolCats deployed to: ${coolCats.address} on ${network}`);

  writeDeployment(network, "CoolCats", coolCats.address, []);
});
