import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

task("deploy:FurionPricingOracle", "Deploy furion pricing oracle contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addressList = readAddressList();

  const fpo = await deploy(ethers, "FurionPricingOracle", null);

  console.log();
  console.log(`Furion pricing oracle deployed to: ${fpo.address} on ${_network}`);

  addressList[_network].FurionPricingOracle = fpo.address;
  storeAddressList(addressList);

  const init_price = await fpo.initPrice(addressList[_network].CoolCats, 1);
  await init_price.wait();
  const update_price = await fpo.updatePrice(addressList[_network].CoolCats, 0, (2.5e18).toString());
  await update_price.wait();
  console.log("Added Cool Cats price");

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await fpo.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: fpo.address,
      });
    } catch (e) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${fpo.address}`);
      }
    }
  }
});
