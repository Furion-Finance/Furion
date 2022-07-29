import "@nomiclabs/hardhat-ethers";
import { formatUnits } from "ethers/lib/utils";
import { task, types } from "hardhat/config";

import { readAddressList } from "../../scripts/contractAddress";
import { FurionToken__factory, IncomeMaker__factory } from "../../typechain";

task("collectSwapIncome", "Collect income from FurionSwap to income sharing vault")
  .addParam("token0", "Address of token0 from FurionSwap pair", null, types.string)
  .addParam("token1", "Address of token1 from FurionSwap pair", null, types.string)
  .setAction(async (taskArgs, hre) => {
    console.log("\nCollect income from FurionSwap to income sharing vault...\n");

    const token0 = taskArgs.token0;
    const token1 = taskArgs.token1;

    const { network } = hre;

    // Signers
    const [dev] = await hre.ethers.getSigners();
    console.log("The default signer is: ", dev.address);

    const addressList = readAddressList();

    // Income maker contract
    const maker = new IncomeMaker__factory(dev).attach(addressList[network.name].IncomeMaker);

    const furion = new FurionToken__factory(dev).attach(addressList[network.name].FurionToken);

    const balBefore = await furion.balanceOf(addressList[network.name].IncomeSharingVault);
    console.log("Income sharing vault bal before: ", formatUnits(balBefore, 18));

    const tx = await maker.collectIncomeFromSwap(token0, token1);
    console.log("Tx details: ", await tx.wait());

    const balAfter = await furion.balanceOf(addressList[network.name].IncomeSharingVault);
    console.log("Income sharing vault bal after: ", formatUnits(balAfter, 18));
  });
