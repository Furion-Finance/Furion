import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { clearSeparatePoolList, readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

task("deploy:SeparatePoolFactory", "Deploy seaparate pool factory contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addressList = readAddressList();

  const spf = await deploy(
    ethers,
    "SeparatePoolFactory",
    addressList[_network].IncomeMaker,
    addressList[_network].Checker,
    addressList[_network].FurionToken,
  );

  console.log();
  console.log(`Separate pool factory deployed to: ${spf.address} on ${_network}`);

  addressList[_network].SeparatePoolFactory = spf.address;
  storeAddressList(addressList);

  clearSeparatePoolList();

  const checker = await ethers.getContractAt("Checker", addressList[_network].Checker);
  const tx = await checker.setSPFactory(spf.address);
  await tx.wait();

  console.log("Separate pool factory added to checker");

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await spf.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: spf.address,
        constructorArguments: [
          addressList[_network].IncomeMaker,
          addressList[_network].Checker,
          addressList[_network].FurionToken,
        ],
      });
    } catch (e) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${spf.address}`);
      }
    }
  }
});
