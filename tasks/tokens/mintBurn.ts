import "@nomiclabs/hardhat-ethers";
import { parseUnits } from "ethers/lib/utils";
import { subtask, task, types } from "hardhat/config";

import { readAddressList } from "../../scripts/contractAddress";
import { FurionToken__factory, MockUSD__factory } from "../../typechain";
import { getNetwork } from "../helpers";

// npx hardhat addMinterBurner --type minter --name StakingPoolFactory --network localhost
task("addMinterBurner", "Add minter/burner manually for certain token")
  .addParam("type", "Minter or burner", null, types.string)
  .addParam("name", "New minter name", null, types.string)
  .addParam("token", "Token name", "FurionToken", types.string)
  .setAction(async (taskArgs, hre) => {
    console.log("\nAdding minter or burner for FUR...\n");

    const minterContractName = taskArgs.name;
    const tokenName = taskArgs.token;

    const addressList = readAddressList();

    const network = getNetwork();

    // Get the token contract instance
    const TokenContract = await hre.ethers.getContractFactory(tokenName);
    const token = TokenContract.attach(addressList[network][tokenName]);

    // Get the minter address to be added
    const newMinterContract = addressList[network][minterContractName];

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

// npx hardhat mintFUR --address 0x90C6e725FbC83cC9AB440B62ce75d07a229CEd44
// --amount 100000000 --network localhost
task("mintFUR", "mint furion token")
  .addParam("address", "address to receive the token", null, types.string)
  .addParam("amount", "amount to mint", null, types.string)
  .setAction(async (taskArgs, hre) => {
    const addressList = readAddressList();

    const { network } = hre;

    const [dev] = await hre.ethers.getSigners();

    // Get the token contract instance
    const furion = new FurionToken__factory(dev).attach(addressList[network.name].FurionToken);

    // Add minter
    const tx = await furion.mintFurion(taskArgs.address, parseUnits(taskArgs.amount));

    console.log(await tx.wait());

    console.log("\n Successfully mint FUR tokens to", taskArgs.address, "\n");
  });

task("burnFUR", "burn furion token")
  .addParam("address", "address to burn the token", null, types.string)
  .addParam("amount", "amount to mint", null, types.string)
  .setAction(async (taskArgs, hre) => {
    const addressList = readAddressList();

    const { network } = hre;

    const [dev] = await hre.ethers.getSigners();

    // Get the token contract instance
    const furion = new FurionToken__factory(dev).attach(addressList[network.name].FurionToken);

    // Add minter
    const tx = await furion.burnFurion(taskArgs.address, parseUnits(taskArgs.amount));

    console.log(await tx.wait());

    console.log("\n Successfully burn FUR tokens from", taskArgs.address, "\n");
  });

task("mintUSD", "mint mock USD token")
  .addParam("address", "address to receive the mock USD", null, types.string)
  .addParam("amount", "amount to mint", null, types.string)
  .setAction(async (taskArgs, hre) => {
    const addressList = readAddressList();

    const { network } = hre;

    if (network.name == "mainnet") return;

    const [dev] = await hre.ethers.getSigners();

    // Get the token contract instance
    const usd = new MockUSD__factory(dev).attach(addressList[network.name].MockUSD);

    // Add minter
    const tx = await usd.mint(taskArgs.address, taskArgs.amount);

    console.log(await tx.wait());

    console.log("\n Successfully mint mock USD to", taskArgs.address, "\n");
  });
