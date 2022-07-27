import "@nomiclabs/hardhat-ethers";
import { formatUnits } from "ethers/lib/utils";
import { task, types } from "hardhat/config";

import { getTokenAddressOnMainnet } from "../../info/tokenAddress";
import { readAddressList } from "../../scripts/contractAddress";
import {
  FurionSwapFactory,
  FurionSwapFactory__factory,
  FurionSwapPair,
  FurionSwapPair__factory,
  FurionSwapV2Router,
  FurionSwapV2Router__factory,
  MockUSD,
  MockUSD__factory,
} from "../../typechain";

task("setIncomeMakerAddress", "Set new address for FurionSwap's income maker")
  .addParam("incomeMaker", "Address for the new income maker")
  .setAction(async (taskArgs, hre) => {
    console.log("\n Setting new income maker for FurionSwap... \n");

    const { network } = hre;
    const incomeMaker = taskArgs.incomeMaker;

    // Signers
    const [dev] = await hre.ethers.getSigners();
    console.log("The default signer is:", dev.address);

    const addressList = readAddressList();

    const factory = new FurionSwapFactory__factory(dev).attach(addressList[network.name].FurionSwapFactory);

    const tx = await factory.setIncomeMakerAddress(incomeMaker);
    console.log("Tx details:", await tx.wait());

    console.log("\n Finish setting new income maker for FurionSwap \n");
  });

task("setIncomeMakerProportion", "Set new proportion for FurionSwap's income maker")
  .addParam("proportion", "Address for the new income maker")
  .setAction(async (taskArgs, hre) => {
    console.log("\n Setting new proportion for FurionSwap... \n");

    const { network } = hre;
    const proportion = taskArgs.proportion;

    // Signers
    const [dev] = await hre.ethers.getSigners();
    console.log("The default signer is:", dev.address);

    const addressList = readAddressList();

    const factory = new FurionSwapFactory__factory(dev).attach(addressList[network.name].FurionSwapFactory);

    const tx = await factory.setIncomeMakerProportion(proportion);
    console.log("Tx details:", await tx.wait());

    console.log("\n Finish setting new income maker proportion for FurionSwap \n");
  });
