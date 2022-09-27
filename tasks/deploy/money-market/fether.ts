import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../../scripts/contractAddress";
import { deployUpgradeable, getNetwork, writeMarketDeployment } from "../../helpers";

task("deploy:FEther", "Deploy FEther contract").setAction(async function (
  taskArguments: TaskArguments,
  { ethers, upgrades },
) {
  const network = getNetwork();
  const addressList = readAddressList();

  const args = [
    addressList[network].RiskManager,
    addressList[network].NormalInterestRateModel,
    addressList[network].PriceOracle,
    addressList[network].Checker,
  ];
  const feth = await deployUpgradeable(ethers, upgrades, "FEther", args);

  console.log();
  console.log(`FEther deployed to: ${feth.address}`);

  const implementation = await upgrades.erc1967.getImplementationAddress(feth.address);
  writeMarketDeployment(network, "fETH", feth.address, implementation);
});
