import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import { config as dotenvConfig } from "dotenv";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-gas-reporter";
import "hardhat-spdx-license-identifier";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import { resolve } from "path";
import "solidity-coverage";

import "./tasks";
// tasks from FarmingPool
import "./tasks/furion-farming/farmingPool";
// tasks from FurionSwap
import "./tasks/furion-swap/setCheckStates";
import "./tasks/furion-swap/tradingPair";
// tasks from IncomeSharing
import "./tasks/income-sharing/incomeMaker";
// tasks from Tokens
import "./tasks/tokens/mintBurn";

dotenvConfig({ path: resolve(__dirname, "./.env") });

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC;

const privateKey: string | undefined = process.env.PRIVATE_KEY;

if (!privateKey && !mnemonic) {
  throw new Error("Please set your PRIVATE_KEY or MNEMONIC in a .env file");
}

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY;
if (!infuraApiKey) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
}

const chainIds = {
  "arbitrum-mainnet": 42161,
  avalanche: 43114,
  bsc: 56,
  hardhat: 31337,
  mainnet: 1,
  "optimism-mainnet": 10,
  "polygon-mainnet": 137,
  "polygon-mumbai": 80001,
  rinkeby: 4,
};

function getChainConfig(chain: keyof typeof chainIds): NetworkUserConfig {
  let jsonRpcUrl: string;
  switch (chain) {
    case "avalanche":
      jsonRpcUrl = "https://api.avax.network/ext/bc/C/rpc";
      break;
    case "bsc":
      jsonRpcUrl = "https://bsc-dataseed1.binance.org";
      break;
    default:
      jsonRpcUrl = "https://" + chain + ".infura.io/v3/" + infuraApiKey;
  }

  let accounts: [] | any;
  // if (mnemonic) {
  //   accounts = {
  //     count: 10,
  //     mnemonic,
  //     path: "m/44'/60'/0'/0",
  //   }
  // } else {
  accounts = [`${privateKey}`];
  // }
  return {
    accounts: accounts,
    chainId: chainIds[chain],
    url: jsonRpcUrl,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      avalanche: process.env.SNOWTRACE_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      optimisticEthereum: process.env.OPTIMISM_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      rinkeby: process.env.ETHERSCAN_API_KEY || "",
    },
  },

  namedAccounts: {
    deployer: {
      default: 0,
      localhost: 0,
      rinkeby: "0xA10f8ecb4d91Ae5CA3291d0bFF159bd5F882A5f5",
      fuji: 0,
      avax: 0,
      avaxTest: 0,
    },
    testAddress: {
      default: 1,
      localhost: 1,
      fuji: 1,
      avax: 1,
      avaxTest: 1,
    },
  },

  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS == "true" ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      chainId: chainIds.hardhat,
    },
    arbitrum: getChainConfig("arbitrum-mainnet"),
    avalanche: getChainConfig("avalanche"),
    bsc: getChainConfig("bsc"),
    mainnet: getChainConfig("mainnet"),
    optimism: getChainConfig("optimism-mainnet"),
    "polygon-mainnet": getChainConfig("polygon-mainnet"),
    "polygon-mumbai": getChainConfig("polygon-mumbai"),
    rinkeby: getChainConfig("rinkeby"),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.13",
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/solidity-template/issues/31
        bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  typechain: {
    outDir: "./typechain",
    target: "ethers-v5",
  },
  spdxLicenseIdentifier: {
    overwrite: true,
    runOnCompile: true,
  },
};

export default config;
