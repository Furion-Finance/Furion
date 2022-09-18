import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList, readProxyAdmin, storeAddressList, storeProxyAdmin } from "../../../scripts/contractAddress";
import { deploy } from "../../helpers";

task("deploy:ProxyAdmin", "Deploy proxy admin").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const hre = require("hardhat");
  const { network } = hre;
  const _network = network.name == "hardhat" ? "localhost" : network.name;

  const addressList = readAddressList();
  const proxyAddressList = readProxyAdmin();

  const proxy = await deploy(ethers, "ProxyAdmin", null);

  console.log();
  console.log(`ProxyAdmin deployed to: ${proxy.address} on ${_network}`);

  addressList[_network].ProxyAdmin = proxy.address;
  proxyAddressList[_network] = proxy.address;
  storeAddressList(addressList);

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await proxy.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: proxy.address,
        constructorArguments: [],
      });
    } catch (e: any) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${proxy.address}`);
      }
    }
  }
});
