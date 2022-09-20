import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

task("deploy:TestClaim", "Deploy TestClaim contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addressList = readAddressList();

  const testClaim = await deploy(
    ethers,
    "TestClaim",
    addressList[_network].FurionToken,
    addressList[_network].MockUSD,
    addressList[_network].CoolCats,
  );

  console.log();
  console.log(`TestClaim deployed to: ${testClaim.address} on ${_network}`);

  addressList[_network].TestClaim = testClaim.address;
  storeAddressList(addressList);

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await testClaim.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: testClaim.address,
        constructorArguments: [
          addressList[_network].FurionToken,
          addressList[_network].MockUSD,
          addressList[_network].CoolCats,
        ],
      });
    } catch (e: any) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${testClaim.address}`);
      }
    }
  }
});
