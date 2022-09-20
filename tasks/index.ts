const deployChecker = require("./deploy/checker.ts");
const deploySeparatePoolFactory = require("./deploy/furion-pools/separatePoolFactory");
const deployFurionPricingOracle = require("./deploy/furion-pools/furionPricingOracle");
const dpeloyAggregatePoolFactory = require("./deploy/furion-pools/aggregatePoolFactory");
const deployFErc20 = require("./deploy/money-market/ferc20");
const deployFEther = require("./deploy/money-market/fether");
const deployNormalInterestRateModel = require("./deploy/money-market/normalInterestRateModel");
const deployJumpInterestRateModel = require("./deploy/money-market/jumpInterestRateModel");
const deployPriceOracle = require("./deploy/money-market/priceOracle");
const deployRiskManager = require("./deploy/money-market/riskManager");

const deployTestFurionPools = require("./deploy/furion-pools/testFurionPools");
const deployTestMarket = require("./deploy/money-market/testMarket");

const upgradeFEther = require("./upgrade/money-market/fether");
const upgradeFErc20 = require("./upgrade/money-market/ferc20");
const upgradeRiskManager = require("./upgrade/money-market/riskManager");

const createSeparatePool = require("./furion-pools/separatePoolFactory");
const createAggregatePool = require("./furion-pools/aggregatePoolFactory");

const accounts = require("./accounts");

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
const addFarmingMinter = require("./furion-farming/farmingPool");
const addMinterBurner = require("./tokens/mintBurn");

const deployFurionFarming = require("./deploy/furion-farming/furionFarming");
const deployTestFarming = require("./deploy/furion-farming/testFarming");

const deployTestnet = require("./deploy/testnet");

const addFarmingPool = require("./furion-farming/farmingPool");

export {
  accounts,
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
  addFarmingMinter,
  addMinterBurner,
  deployFurionFarming,
  deployTestFarming,
  deployTestnet,
  addFarmingPool,
};
