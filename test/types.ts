import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import type { Fixture } from "ethereum-waffle";

import type { Checker } from "../src/types/contracts/Checker";
import type { ProjectPool } from "../src/types/contracts/project-pool/ProjectPool";
import type { ProjectPoolFactory } from "../src/types/contracts/project-pool/ProjectPoolFactory";
import type { RootPool } from "../src/types/contracts/root-pool/RootPool";
import type { RootPoolFactory } from "../src/types/contracts/root-pool/RootPoolFactory";
import type { FurionTokenTest } from "../src/types/contracts/test-only/FurionTokenTest";
import type { NFTest } from "../src/types/contracts/test-only/NFTest";
import type { NFTest1 } from "../src/types/contracts/test-only/NFTest1";
import type { FurionToken } from "../src/types/contracts/tokens/FurionToken";

declare module "mocha" {
  export interface Context {
    nft: NFTest;
    nft1: NFTest1;
    ppf: ProjectPoolFactory;
    pp: ProjectPool;
    pp1: ProjectPool;
    rpf: RootPoolFactory;
    rp: RootPool;
    rp1: RootPool;
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
