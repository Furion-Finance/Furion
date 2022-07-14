import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import type { Fixture } from "ethereum-waffle";

import type { Checker } from "../src/types/contracts/Checker";
import type { AggregatePool } from "../src/types/contracts/aggregate-pool/AggregatePool";
import type { AggregatePoolFactory } from "../src/types/contracts/aggregate-pool/AggregatePoolFactory";
import type { SeparatePool } from "../src/types/contracts/separate-pool/SeparatePool";
import type { SeparatePoolFactory } from "../src/types/contracts/separate-pool/SeparatePoolFactory";
import type { FurionTokenTest } from "../src/types/contracts/test-only/FurionTokenTest";
import type { NFTest } from "../src/types/contracts/test-only/NFTest";
import type { NFTest1 } from "../src/types/contracts/test-only/NFTest1";
import type { FurionToken } from "../src/types/contracts/tokens/FurionToken";

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
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  bob: SignerWithAddress;
  alice: SignerWithAddress;
}
