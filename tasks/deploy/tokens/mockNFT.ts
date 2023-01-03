import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readAddressList } from "../../../scripts/contractAddress";
import { deploy, getNetwork, writeDeployment } from "../../helpers";

let args = [
  ["BAYC", "BAYC", "", 0, 10000],
  ["MAYC", "MAYC", "", 0, 19431],
  ["Otherdeed", "OTHR", "", 0, 100000],
  ["BAKC", "BAKC", "", 0, 9602],
  ["Azuki", "AZUKI", "", 0, 10000],
  ["Doodles", "DOODLE", "", 0, 10000],
  ["Meebits", "Meebits", "", 1, 20000],
  ["Weirdo Ghost Gang", "GHOST", "", 0, 5556],
  ["Catddle", "CAT", "", 1, 2048],
  ["Mimic Shhans", "SHHANS", "", 1, 10020],
];

task("deploy:MockNFTs", "Deploy 11 mock NFT collections").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const network = getNetwork();

  for (let nftArg of args) {
    const nft = await deploy(ethers, "MockERC721", nftArg);
    writeDeployment(network, nftArg[0], nft.address, nftArg);
    console.log(`Mock ${nftArg[0]} deployed to ${network} at ${nft.address}`);
  }
});

task("verify:MockNFTs", "Verify all 11 mock NFT collections").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");

  for (let nftArg of args) {
    await hre.run("verifier", {
      name: nftArg[0],
    });
    console.log(`${nftArg[0]} verified`);
  }
});

task("MockNFT:AddMinter", "Add Test Claim contract as minter to all mock NFTs").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const addresses = readAddressList()[getNetwork()];

  if (!addresses["TestClaim"]) {
    console.log("Test Claim contract not found");
    return;
  }

  for (let nftArg of args) {
    const contract = await ethers.getContractAt("MockERC721", addresses[nftArg[0]]);

    try {
      await contract.registerMinter(addresses["TestClaim"]);
      console.log(`Added Test Claim as minter of ${nftArg[0]}`);
    } catch (e) {
      console.log("Already added");
    }
  }
});
