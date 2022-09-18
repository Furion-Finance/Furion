import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

task("deploy:MockToken", "Deploy mock token contracts").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addressList = readAddressList();

  // ******************************* Deploy & Verify MockUSD ******************************** //
  const mockUSD = await deploy(ethers, "MockUSD", null);

  console.log();
  console.log(`Mock USD deployed to: ${mockUSD.address} on ${_network}`);

  addressList[_network].MockUSD = mockUSD.address;
  storeAddressList(addressList);

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await mockUSD.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: mockUSD.address,
      });
    } catch (e: any) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${mockUSD.address}`);
      }
    }
  }

  // ******************************* Deploy & Verify WETH ******************************** //
  const weth = await deploy(ethers, "WETH9", null);

  console.log();
  console.log(`Mock WETH deployed to: ${weth.address} on ${_network}`);

  addressList[_network].WETH = weth.address;
  storeAddressList(addressList);

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await weth.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: weth.address,
      });
    } catch (e: any) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${weth.address}`);
      }
    }
  }
});
