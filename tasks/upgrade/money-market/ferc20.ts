import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { upgrade } from "../../helpers";

task("upgrade:FErc20", "Upgrade FErc20 contract")
  .addParam("address", "Address of proxy contract to upgrade")
  .setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
    await upgrade(ethers, upgrades, "FErc20", taskArguments.address);

    console.log("FErc20 upgraded");
  });
