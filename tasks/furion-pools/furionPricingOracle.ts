import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../scripts/contractAddress";
import { getNetwork } from "../helpers";

task("FPO:SetFirst", "Set price for an NFT for the first time")
  .addParam("nft", "Address of NFT")
  .addParam("price", "Price of NFT in terms of ETH")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const network = getNetwork();
    const addressList = readAddressList();

    const fpo = await ethers.getContractAt("FurionPricingOracle", addressList[network].FurionPricingOracle);
    const init = await fpo.initPrice(taskArguments.nft, 1);
    await init.wait();

    const update = await fpo.updatePrice(taskArguments.nft, 0, ethers.utils.parseEther(taskArguments.price));
    console.log("Price updated");
  });

task("FPO:SetTestnetPrices", "Set prices for all testnet NFTs").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");
  const network = getNetwork();
  const addresses = readAddressList()[network];

  await hre.run("FPO:SetFirst", { nft: addresses["BAYC"], price: "50" });
  await hre.run("FPO:SetFirst", { nft: addresses["MAYC"], price: "10" });
  await hre.run("FPO:SetFirst", { nft: addresses["Otherdeed"], price: "1" });
  await hre.run("FPO:SetFirst", { nft: addresses["BAKC"], price: "5" });
  //await hre.run("FPO:SetFirst", { nft: "0x5b6de5670dC4c5ce6bbFC31DAdF514b2Ab968450", price: "50" });
  await hre.run("FPO:SetFirst", { nft: addresses["Azuki"], price: "10" });
  await hre.run("FPO:SetFirst", { nft: addresses["Doodles"], price: "10" });
  await hre.run("FPO:SetFirst", { nft: addresses["Meebits"], price: "5" });
  await hre.run("FPO:SetFirst", { nft: addresses["Weirdo Ghost Gang"], price: "0.2" });
  await hre.run("FPO:SetFirst", { nft: addresses["Catddle"], price: "0.05" });
  await hre.run("FPO:SetFirst", { nft: addresses["Mimic Shhans"], price: "0.1" });
});
