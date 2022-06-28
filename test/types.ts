import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import type { Fixture } from "ethereum-waffle";

import type { ProjectPool } from "../src/types/contracts/project-pool/ProjectPool";
import type { ProjectPoolFactory } from "../src/types/contracts/project-pool/ProjectPoolFactory";
import type { NFTest } from "../src/types/contracts/test-only/NFTest";

declare module "mocha" {
  export interface Context {
    nft: NFTest;
    ppf: ProjectPoolFactory;
    pool: ProjectPool;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  bob: SignerWithAddress;
  alice: SignerWithAddress;
}
