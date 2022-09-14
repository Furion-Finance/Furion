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
const deployTestMarket = require("./deploy/money-market/testMarket");

const upgradeFEther = require("./upgrade/money-market/fether");
const upgradeFErc20 = require("./upgrade/money-market/ferc20");
const upgradeRiskManager = require("./upgrade/money-market/riskManager");

const createSeparatePool = require("./furion-pools/separatePoolFactory");
const createAggregatePool = require("./furion-pools/aggregatePoolFactory");

const accounts = require("./accounts");

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
  deployTestMarket,
  upgradeFEther,
  upgradeFErc20,
  upgradeRiskManager,
  createSeparatePool,
  createAggregatePool,
};
