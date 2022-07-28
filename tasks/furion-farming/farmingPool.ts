import "@nomiclabs/hardhat-ethers";
import { subtask, task, types } from "hardhat/config";

import { readAddressList } from "../../scripts/contractAddress";
import { FurionToken, FurionToken__factory } from "../../typechain";

task("addFarmingMinter", "Add FUR minter to farming contract").setAction(async (_, hre) => {
  const { network } = hre;

  // Signers
  const [dev] = await hre.ethers.getSigners();
  console.log("The default signer is: ", dev.address);

  const addressList = readAddressList();
  const farmingPoolAddress = addressList[network.name].FarmingPoolUpgradeable;
  const FurionTokenAddress = addressList[network.name].FurionToken;

  // Get the contract instance
  const FurionToken: FurionToken__factory = await hre.ethers.getContractFactory("FurionToken");
  const Furion: FurionToken = FurionToken.attach(FurionTokenAddress);

  // Add minter for Furion token
  const isAlready = await Furion.isMinter(farmingPoolAddress);
  if (!isAlready) {
    const tx = await Furion.addMinter(farmingPoolAddress);
    console.log(await tx.wait());
  }
  console.log("\nFinish Adding minter for farming contract...\n");
});

task("addFarmingPool");
