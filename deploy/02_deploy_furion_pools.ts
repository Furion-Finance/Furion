import { DeployFunction, ProxyOptions } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  clearAggregatePoolList,
  clearSeparatePoolList,
  readAddressList,
  storeAddressList,
} from "../scripts/contractAddress";
import { deploy } from "../tasks/helpers";

// Deploy Furion Liquidity Pools(Checker => SeparatePoolFactory => FurionOracle => AggregatePoolFactory)
// Tasks:
//    -
// Tags:
//    - FurionPools
//
// And verify contracts after deployment

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { network, ethers } = hre;

  // ************************************* Preparation ************************************** //

  // Read address list from local file
  const addressList = readAddressList();
  const _network = network.name == "hardhat" ? "localhost" : network.name;

  // ******************************* Deploy & Verify Checker ******************************** //
  const checker = await deploy(ethers, "Checker", null);

  console.log();
  console.log(`Checker deployed to: ${checker.address} on ${_network}`);

  addressList[_network].Checker = checker.address;
  storeAddressList(addressList);

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await checker.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: checker.address,
      });
    } catch (e: any) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${checker.address}`);
      }
    }
  }

  // ************************* Deploy & Verify SeparatePoolFactory ************************** //
  const spf = await deploy(
    ethers,
    "SeparatePoolFactory",
    addressList[_network].IncomeMaker,
    addressList[_network].Checker,
    addressList[_network].FurionToken,
  );

  console.log();
  console.log(`Separate pool factory deployed to: ${spf.address} on ${_network}`);

  addressList[_network].SeparatePoolFactory = spf.address;
  storeAddressList(addressList);

  clearSeparatePoolList();

  // link checker and separatePoolFactory
  let tx = await checker.setSPFactory(spf.address);
  await tx.wait();

  console.log("Separate pool factory added to checker");

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await spf.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: spf.address,
        constructorArguments: [
          addressList[_network].IncomeMaker,
          addressList[_network].Checker,
          addressList[_network].FurionToken,
        ],
      });
    } catch (e: any) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${spf.address}`);
      }
    }
  }

  // ************************* Deploy & Verify FurionOracle ************************** //
  const fpo = await deploy(ethers, "FurionPricingOracle", null);

  console.log();
  console.log(`Furion pricing oracle deployed to: ${fpo.address} on ${_network}`);

  addressList[_network].FurionPricingOracle = fpo.address;
  storeAddressList(addressList);

  const init_price = await fpo.initPrice(addressList[_network].CoolCats, 1);
  await init_price.wait();
  const update_price = await fpo.updatePrice(addressList[_network].CoolCats, 0, (2.5e18).toString());
  await update_price.wait();
  console.log("Added Cool Cats price");

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await fpo.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: fpo.address,
      });
    } catch (e: any) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${fpo.address}`);
      }
    }
  }

  // ************************* Deploy & Verify AggregatePoolFactory ************************** //
  const apf = await deploy(
    ethers,
    "AggregatePoolFactory",
    addressList[_network].Checker,
    addressList[_network].FurionToken,
    addressList[_network].FurionPricingOracle,
    addressList[_network].SeparatePoolFactory,
  );

  console.log();
  console.log(`Aggregate pool factory deployed to: ${apf.address} on ${_network}`);

  addressList[_network].AggregatePoolFactory = apf.address;
  storeAddressList(addressList);

  clearAggregatePoolList();

  tx = await checker.setAPFactory(apf.address);
  await tx.wait();

  console.log("Aggregate pool factory added to checker");

  if (_network != "localhost") {
    try {
      console.log("Waiting confirmations before verifying...");
      await apf.deployTransaction.wait(4);
      await hre.run("verify:verify", {
        address: apf.address,
        constructorArguments: [
          addressList[_network].Checker,
          addressList[_network].FurionToken,
          addressList[_network].FurionPricingOracle,
          addressList[_network].SeparatePoolFactory,
        ],
      });
    } catch (e: any) {
      const array = e.message.split(" ");
      if (array.includes("Verified") || array.includes("verified")) {
        console.log("Already verified");
      } else {
        console.log(e);
        console.log(`Check manually at https://${_network}.etherscan.io/address/${apf.address}`);
      }
    }
  }
};

func.tags = ["FurionPools"];
export default func;
