import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// Deploy Basic Tokens
// It is a non-proxy deployment
// Contract:
//    - FUR Token
//    - Mock
//      - Mock ERC20
//      - Mock USD
//      - Mock WETH
// Tags:
//    - Tokens
import { getTokenAddressOnMainnet } from "../info/tokenAddress";
import { readAddressList, storeAddressList } from "../scripts/contractAddress";

const wethAddress: string = getTokenAddressOnMainnet("WETH");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, save, getArtifact } = deployments;

  network.name = network.name == "hardhat" ? "localhost" : network.name;

  const { deployer } = await getNamedAccounts();

  // Read address list from local file
  const addressList = readAddressList();

  // Deploy furion token contract
  // No constructor args
  const furion = await deploy("FurionToken", {
    contract: "FurionToken",
    from: deployer,
    args: [],
    log: true,
  });
  addressList[network.name].FurionToken = furion.address;

  if (network.name == "mainnet") {
    // stable coin instance for mainnet deployment
    const IERC20ABI = await getArtifact("ERC20").then((x: any) => x.abi);
    await save("USDT", {
      address: wethAddress,
      abi: IERC20ABI,
    });
    addressList[network.name].USDT = IERC20ABI;

    // weth instance for mainnet
    const IWETHABI = await getArtifact("WETH9").then((x: any) => x.abi);
    await save("WETH", {
      address: wethAddress,
      abi: IWETHABI,
    });
    addressList[network.name].WETH = wethAddress;
  } else {
    // mock USD for other networks
    const mockUSD = await deploy("MockUSD", {
      contract: "MockUSD",
      from: deployer,
      args: [],
      log: true,
    });
    addressList[network.name].MockUSD = mockUSD.address;

    const mockWeth = await deploy("WETH", {
      contract: "WETH9",
      from: deployer,
      args: [],
      log: true,
    });
    addressList[network.name].WETH = mockWeth.address;
  }

  // Store the address list after deployment
  storeAddressList(addressList);
};

func.tags = ["Tokens"];
export default func;
