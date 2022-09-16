import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { clearAggregatePoolList, readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

task("deploy:AggregatePoolFactory", "Deploy aggregate pool factory contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addressList = readAddressList();

  const apf = await deploy(
    ethers,
    "AggregatePoolFactory",
    addressList[_network].Checker,
    addressList[_network].FurionToken,
    addressList[_network].FurionPricingOracle,
    addressList[_network].SeparatePoolFactory,
  );

  console.log();
  console.log(`Aggregate pool factory deployed to: ${apf.address} on ${_network}`);

  addressList[_network].AggregatePoolFactory = apf.address;
  storeAddressList(addressList);

  clearAggregatePoolList();

  const checker = await ethers.getContractAt("Checker", addressList[_network].Checker);
  const tx = await checker.setAPFactory(apf.address);
  await tx.wait();

  console.log("Aggregate pool factory added to checker");

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await apf.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: apf.address,
        constructorArguments: [
          addressList[_network].Checker,
          addressList[_network].FurionToken,
          addressList[_network].FurionPricingOracle,
          addressList[_network].SeparatePoolFactory,
        ],
      });
    } catch (e) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${apf.address}`);
      }
    }
  }
});
