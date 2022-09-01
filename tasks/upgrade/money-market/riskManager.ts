import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { upgrade } from "../../helpers";

task("upgrade:RiskManager", "Upgrade risk manager contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers, upgrades },
) {
  await upgrade(ethers, upgrades, "RiskManager", "0x16625d22c9045707de8f90E0c6b22B5aFA4320FF");

  console.log("Risk manager upgraded");
});
