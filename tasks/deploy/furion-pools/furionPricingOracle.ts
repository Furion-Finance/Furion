import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../../scripts/contractAddress";
import { deploy, getNetwork, writeDeployment } from "../../helpers";

task("deploy:FurionPricingOracle", "Deploy furion pricing oracle contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const network = getNetwork();

  const fpo = await deploy(ethers, "FurionPricingOracle", []);

  console.log();
  console.log(`Furion pricing oracle deployed to: ${fpo.address} on ${network}`);

  writeDeployment(network, "FurionPricingOracle", fpo.address, []);

  const addressList = readAddressList();
  const init_price = await fpo.initPrice(addressList[network].CoolCats, 1);
  await init_price.wait();
  const update_price = await fpo.updatePrice(addressList[network].CoolCats, 0, (2.5e18).toString());
  await update_price.wait();
  console.log("Added Cool Cats price");
});
