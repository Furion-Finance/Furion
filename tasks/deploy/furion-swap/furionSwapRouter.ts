import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, storeAddressList } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

task("deploy:FurionSwapV2Router", "Deploy FurionSwapV2Router contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;
  const addressList = readAddressList();

  const furionSwapV2Router = await deploy(
    ethers,
    "FurionSwapV2Router",
    addressList[_network].FurionSwapFactory,
    addressList[_network].WETH,
  );

  console.log();
  console.log(`FurionSwapV2Router deployed to: ${furionSwapV2Router.address} on ${_network}`);

  addressList[_network].FurionSwapV2Router = furionSwapV2Router.address;
  storeAddressList(addressList);

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await furionSwapV2Router.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: furionSwapV2Router.address,
        constructorArguments: [addressList[_network].FurionSwapFactory, addressList[_network].WETH],
      });
    } catch (e: any) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${furionSwapV2Router.address}`);
      }
    }
  }
});
