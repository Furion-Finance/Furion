import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../../scripts/contractAddress";
import { getNetwork } from "../../helpers";

task("deploy:TestIncomeSharing", "Deploy all income sharing contracts").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");

  await hre.run("deploy:IncomeSharingVault");
  await hre.run("deploy:IncomeMaker");
});
