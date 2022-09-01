import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { deploy } from "../../helpers";

task("deploy:PriceOracle", "Deploy price oracle contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const po = await deploy(ethers, "SimplePriceOracle", null);

  console.log("Price oracle deployed to: ", po.address);
});
