import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { Checker } from "../typechain/contracts/Checker";
import type { AggregatePool } from "../typechain/contracts/aggregate-pool/AggregatePool";
import type { AggregatePoolFactory } from "../typechain/contracts/aggregate-pool/AggregatePoolFactory";
import type { FErc20 } from "../typechain/contracts/money-market/FErc20";
import type { FEther } from "../typechain/contracts/money-market/FEther";
import type { JumpInterestRateModel } from "../typechain/contracts/money-market/JumpInterestRateModel";
import type { NormalInterestRateModel } from "../typechain/contracts/money-market/NormalInterestRateModel";
import type { RiskManager } from "../typechain/contracts/money-market/RiskManager";
import type { SimplePriceOracle } from "../typechain/contracts/money-market/SimplePriceOracle";
import type { SeparatePool } from "../typechain/contracts/separate-pool/SeparatePool";
import type { SeparatePoolFactory } from "../typechain/contracts/separate-pool/SeparatePoolFactory";
import type { FurionTokenTest } from "../typechain/contracts/test-only/FurionTokenTest";
import type { NFTest } from "../typechain/contracts/test-only/NFTest";
import type { NFTest1 } from "../typechain/contracts/test-only/NFTest1";
import type { FurionToken } from "../typechain/contracts/tokens/FurionToken";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    nft: NFTest;
    nft1: NFTest1;
    spf: SeparatePoolFactory;
    sp: SeparatePool;
    sp1: SeparatePool;
    apf: AggregatePoolFactory;
    ap: AggregatePool;
    ap1: AggregatePool;
    checker: Checker;
    fur: FurionToken;
    furT: FurionTokenTest;
    ferc: FErc20;
    feth: FEther;
    ffur: FErc20;
    nirm: NormalInterestRateModel;
    jirm: JumpInterestRateModel;
    rm: RiskManager;
    spo: SimplePriceOracle;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  bob: SignerWithAddress;
  alice: SignerWithAddress;
}
