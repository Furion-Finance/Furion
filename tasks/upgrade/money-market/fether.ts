import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { upgrade } from "../../helpers";

task("upgrade:FEther", "Upgrade FEther contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers, upgrades },
) {
  await upgrade(ethers, upgrades, "FEther", "0xc04609A609af7ED23856a4C26cBbD222C128D2Cb");

  console.log("FEther upgraded");
});
