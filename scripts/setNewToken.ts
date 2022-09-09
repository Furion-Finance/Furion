import { FurionToken, FurionToken__factory } from "../typechain";
import { readAddressList } from "./contractAddress";

const hre = require("hardhat");

/**
 * We will adjust token settings in this file
 *  -- Add FarmingPool & TestClaim as minter for FUR token
 *  -- Set FUR as new token receiver for FurionSeparatePool and FurionAggregatePool
 */

const main = async () => {
  const { network } = hre;

  // Signers
  const [dev] = await hre.ethers.getSigners();
  console.log("The default signer is: ", dev.address);

  let tx;

  const addressList = readAddressList();
  const farmingPoolAddress = addressList[network.name].FarmingPoolUpgradeable;
  const testClaimAddress = addressList[network.name].TestClaim;
  const furionTokenAddress = addressList[network.name].FurionToken;

  // load furion token
  const FurionToken: FurionToken__factory = await hre.ethers.getContractFactory("FurionToken");
  const Furion: FurionToken = FurionToken.attach(furionTokenAddress);

  // Add farming pool and test claim as minter for FUR token
  const farmingPoolAlready = await Furion.isMinter(farmingPoolAddress);
  if (!farmingPoolAlready) {
    tx = await Furion.addMinter(farmingPoolAddress);
    console.log(await tx.wait());
  }
  console.log("\nFinish adding minter for farming contract...\n");

  const testClaimlAlready = await Furion.isMinter(testClaimAddress);
  if (!testClaimlAlready) {
    tx = await Furion.addMinter(testClaimAddress);
    console.log(await tx.wait());
  }
  console.log("\nFinish adding minter for test claim contract...\n");
};

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
