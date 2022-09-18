import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("deploy:TestFurionTokens", "Deploy all tokens contracts and TestClaim").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const hre = require("hardhat");

  await hre.run("deploy:FurionToken");
  await hre.run("deploy:MockToken");
  await hre.run("deploy:MockCoolCats");
  await hre.run("deploy:TestClaim");

  await hre.run("addMinterBurner", {
    type: "minter",
    name: "test_claim",
    token: "FurionToken",
  });

  console.log("Successfully deploy all tokens, and add minter for TestClaim contract");
});
