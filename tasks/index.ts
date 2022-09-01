const deployChecker = require("./deploy/checker.ts");
const deploySeparatePoolFactory = require("./deploy/furion-pools/separatePoolFactory");
const deployFErc20 = require("./deploy/money-market/ferc20");
const deployFEther = require("./deploy/money-market/fether");
const deployNormalInterestRateModel = require("./deploy/money-market/normalInterestRateModel");
const deployJumpInterestRateModel = require("./deploy/money-market/jumpInterestRateModel");
const deployPriceOracle = require("./deploy/money-market/priceOracle");
const deployRiskManager = require("./deploy/money-market/riskManager");

const upgradeFEther = require("./upgrade/money-market/fether");
const upgradeFErc20 = require("./upgrade/money-market/ferc20");
const upgradeRiskManager = require("./upgrade/money-market/riskManager");

const accounts = require("./accounts");

export {
  accounts,
  deployChecker,
  deploySeparatePoolFactory,
  deployFErc20,
  deployFEther,
  deployNormalInterestRateModel,
  deployJumpInterestRateModel,
  deployPriceOracle,
  deployRiskManager,
  upgradeFEther,
  upgradeFErc20,
  upgradeRiskManager,
};
