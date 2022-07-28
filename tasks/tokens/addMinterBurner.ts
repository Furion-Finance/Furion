import "@nomiclabs/hardhat-ethers";
import { subtask, task, types } from "hardhat/config";

import { readAddressList } from "../../scripts/contractAddress";

// npx hardhat addMinterBurner --type minter --name StakingPoolFactory --network localhost
task("addMinterBurner", "add minter/burner manually for certain token")
  .addParam("type", "minter or burner", null, types.string)
  .addParam("name", "new minter name", null, types.string)
  .addParam("token", "token name", "FurionToken", types.string)
  .setAction(async (taskArgs, hre) => {
    console.log("\nAdding minter or burner for FUR...\n");

    const minterContractName = taskArgs.name;
    const tokenName = taskArgs.token;

    const addressList = readAddressList();

    const { network } = hre;

    // Get the token contract instance
    const TokenContract = await hre.ethers.getContractFactory(tokenName);
    const token = TokenContract.attach(addressList[network.name][tokenName]);

    // Get the minter address to be added
    const newMinterContract = addressList[network.name][minterContractName];

    if (newMinterContract == "" || !newMinterContract) {
      console.log("No minter address found");
      return;
    }

    if (taskArgs.type == "minter") {
      // Add minter
      const isAlready = await token.isMinter(newMinterContract);
      if (!isAlready) {
        const tx = await token.addMinter(newMinterContract);
        console.log(await tx.wait());
      } else console.log("Already minter");
    } else if (taskArgs.type == "burner") {
      // Add burner
      const isAlready = await token.isBurner(newMinterContract);
      if (!isAlready) {
        const tx = await token.addBurner(newMinterContract);
        console.log(await tx.wait());
      } else console.log("Already burner");
    }

    console.log("\nFinish Adding minter or burner...\n");
  });
