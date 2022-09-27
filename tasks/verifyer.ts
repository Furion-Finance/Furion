import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { readArgs } from "../scripts/contractAddress";
import { getNetwork } from "./helpers";

const furionPools = ["Checker", "SeparatePoolFactory", "AggregatePoolFactory", "FurionPricingOracle"];
const markets = ["JumpInterestRateModel", "NormalInterestRateModel", "PriceOracle", "RiskManager"];

task("verifyer", "Verify contract")
  .addParam("name", "Name of contract")
  .setAction(async function (taskArguments: TaskArguments) {
    const network = await getNetwork();
    if (network === "localhost") {
      console.log("Cannot verify on localhost");
      return;
    }
    const argsList = readArgs();

    for (let name in argsList[network]) {
      if (taskArguments.name === name) {
        try {
          if (argsList[network][name].args.length > 0) {
            await hre.run("verify:verify", {
              address: argsList[network][name].address,
              constructorArguments: argsList[network][name].args,
            });
          } else {
            await hre.run("verify:verify", {
              address: argsList[network][name].address,
            });
          }
        } catch (e) {
          const array = e.message.split(" ");
          if (array.includes("Verified") || array.includes("verified")) {
            console.log("Already verified");
          } else {
            console.log(e);
            console.log(`Check manually at https://${network}.etherscan.io/address/${argsList[network][name].address}`);
          }
        }

        return;
      }
    }

    console.log("Contract not found");
  });

task("verifyer:All", "Verify all contracts").setAction(async function (taskArguments: TaskArguments) {
  const network = getNetwork();
  if (network === "localhost") {
    console.log("Cannot verify on localhost");
    return;
  }
  const argsList = readArgs();

  for (let name in argsList[network]) {
    try {
      if (argsList[network][name].args.length > 0) {
        await hre.run("verify:verify", {
          address: argsList[network][name].address,
          constructorArguments: argsList[network][name].args,
        });
      } else {
        await hre.run("verify:verify", {
          address: argsList[network][name].address,
        });
      }
    } catch (e) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${network}.etherscan.io/address/${argsList[network][name].address}`);
      }
    }
  }
});

task("verifyer:FurionPools", "Verify all furion pools related contracts").setAction(async function (
  taskArguments: TaskArguments,
) {
  const network = getNetwork();
  if (network === "localhost") {
    console.log("Cannot verify on localhost");
    return;
  }
  const argsList = readArgs();

  for (let name of furionPools) {
    try {
      if (argsList[network][name].args.length > 0) {
        await hre.run("verify:verify", {
          address: argsList[network][name].address,
          constructorArguments: argsList[network][name].args,
        });
      } else {
        await hre.run("verify:verify", {
          address: argsList[network][name].address,
        });
      }
    } catch (e) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${network}.etherscan.io/address/${argsList[network][name].address}`);
      }
    }
  }
});

task("verifyer:Market", "Verify all money market related contracts").setAction(async function (
  taskArguments: TaskArguments,
) {
  const network = getNetwork();
  if (network === "localhost") {
    console.log("Cannot verify on localhost");
    return;
  }
  const argsList = readArgs();

  for (let name of markets) {
    try {
      await hre.run("verify:verify", {
        address: argsList[network][name].address,
        constructorArguments: argsList[network][name].args,
      });
    } catch (e) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${network}.etherscan.io/address/${argsList[network][name].address}`);
      }
    }
  }
});
