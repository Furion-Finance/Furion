const deployChecker = require("./deploy/furion-pools/checker");
const deploySeparatePoolFactory = require("./deploy/furion-pools/separatePoolFactory");
const deployFurionPricingOracle = require("./deploy/furion-pools/furionPricingOracle");
const dpeloyAggregatePoolFactory = require("./deploy/furion-pools/aggregatePoolFactory");
const deployTestFurionPools = require("./deploy/furion-pools/testFurionPools");

const deployFErc20 = require("./deploy/money-market/ferc20");
const deployFEther = require("./deploy/money-market/fether");
const deployNormalInterestRateModel = require("./deploy/money-market/normalInterestRateModel");
const deployJumpInterestRateModel = require("./deploy/money-market/jumpInterestRateModel");
const deployPriceOracle = require("./deploy/money-market/priceOracle");
const deployRiskManager = require("./deploy/money-market/riskManager");
const deployTestMarket = require("./deploy/money-market/testMarket");

const upgradeFEther = require("./upgrade/money-market/fether");
const upgradeFErc20 = require("./upgrade/money-market/ferc20");
const upgradeRiskManager = require("./upgrade/money-market/riskManager");

const checker = require("./furion-pools/checker");
const createSeparatePool = require("./furion-pools/separatePoolFactory");
const createAggregatePool = require("./furion-pools/aggregatePoolFactory");
const riskManager = require("./money-market/riskManager");
const priceOracle = require("./money-market/priceOracle");

const accounts = require("./accounts");
const verifier = require("./verifier");

const deployProxyAdmin = require("./deploy/proxy/proxyAdmin");
const deployTestProxy = require("./deploy/proxy/testProxy");

const deployFurion = require("./deploy/tokens/furionToken");
const deployMockToken = require("./deploy/tokens/mockTokens");
const deployMockNFT = require("./deploy/tokens/mockNFT");
const deployTestClaim = require("./deploy/tokens/testClaim");
const deployTestTokens = require("./deploy/tokens/testTokens");

const deployFurionSwapFactory = require("./deploy/furion-swap/furionSwapFactory");
const deployFurionSwapRouter = require("./deploy/furion-swap/furionSwapRouter");
const deployTestFurionSwap = require("./deploy/furion-swap/testFurionSwap");

const createPair = require("./furion-swap/tradingPair");
const swapFactory = require("./furion-swap/swapFactory");
const addFarmingMinter = require("./furion-farming/farmingPool");
const addMinterBurner = require("./tokens/mintBurn");

const deployFurionFarming = require("./deploy/furion-farming/furionFarming");
const deployTestFarming = require("./deploy/furion-farming/testFarming");

const deployTestnet = require("./deploy/testnet");

const deployVoteEscrowedFurion = require("./deploy/furion-staking/veFUR");
const testDeployVoteEscrowedFurion = require("./deploy/furion-staking/testVoteEscrowedFurion");
const veFURFunctions = require("./furion-staking/veFUR");

const addFarmingPool = require("./furion-farming/farmingPool");

const deployIncomeSharingVault = require("./deploy/income-sharing/incomeSharingVault");
const deployIncomeMaker = require("./deploy/income-sharing/incomeMaker");
const deployTestIncomeSharing = require("./deploy/income-sharing/testIncomeSharing");
const incomeSharingVaultFunctions = require("./income-sharing/incomeSharingVault");
const incomeMakerFunctions = require("./income-sharing/incomeMaker");

export {
  accounts,
  verifier,
  deployChecker,
  deploySeparatePoolFactory,
  deployFurionPricingOracle,
  dpeloyAggregatePoolFactory,
  deployFErc20,
  deployFEther,
  deployNormalInterestRateModel,
  deployJumpInterestRateModel,
  deployPriceOracle,
  deployRiskManager,
  deployTestFurionPools,
  deployTestMarket,
  upgradeFEther,
  upgradeFErc20,
  upgradeRiskManager,
  createSeparatePool,
  createAggregatePool,
  deployProxyAdmin,
  deployTestProxy,
  deployFurion,
  deployMockToken,
  deployMockNFT,
  deployTestClaim,
  deployTestTokens,
  deployFurionSwapFactory,
  deployFurionSwapRouter,
  deployTestFurionSwap,
  createPair,
  swapFactory,
  addFarmingMinter,
  addMinterBurner,
  deployFurionFarming,
  deployTestFarming,
  deployTestnet,
  addFarmingPool,
  deployVoteEscrowedFurion,
  testDeployVoteEscrowedFurion,
  veFURFunctions,
  deployIncomeSharingVault,
  deployIncomeMaker,
  deployTestIncomeSharing,
  incomeSharingVaultFunctions,
  incomeMakerFunctions,
};
