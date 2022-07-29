import { formatEther, formatUnits } from "ethers/lib/utils";
import hre from "hardhat";

import { getLatestBlockTimestamp, stablecoinToWei } from "../../test/utils";
import { FurionSwapFactory, FurionSwapFactory__factory } from "../../typechain";
import { readAddressList } from "../contractAddress";

export const deployFactory = async () => {
  const { network } = hre;
  console.log("You are deploying furion-swap-factory at the ", network.name, "network");
};
