import "@nomiclabs/hardhat-ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { task, types } from "hardhat/config";

import { readAddressList } from "../../scripts/contractAddress";
import { IncomeSharingVault, IncomeSharingVault__factory } from "../../typechain";

// tasks
// 1. initialize

// tasks modifying the state of the contract
task("IncomeSharingVault:initialize", "Initialize Income Sharing Vault")
  .addParam("veFURAddress", "Address of veFUR token", null, types.string)
  .setAction(async (TaskArguments, hre) => {
    const _veFURAddress = TaskArguments.veFURAddress;
    const { network } = hre;

    const _network = network.name == "hardhat" ? "localhost" : network.name;
    const addresses = readAddressList();

    const incomeSharingVaultFactory: IncomeSharingVault__factory = await hre.ethers.getContractFactory(
      "IncomeSharingVault",
    );
    const incomeSharingVault: IncomeSharingVault = incomeSharingVaultFactory.attach(
      addresses[_network].IncomeSharingVault,
    );

    const tx = await incomeSharingVault.initialize(_veFURAddress);
    await tx.wait();

    console.log("Task IncomeSharingVault:initialize ended successfully");
  });
