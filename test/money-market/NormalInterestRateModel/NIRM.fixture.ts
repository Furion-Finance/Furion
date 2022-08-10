import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { NormalInterestRateModel } from "../../../src/types/contracts/money-market/NormalInterestRateModel";
import type { NormalInterestRateModel__factory } from "../../../src/types/factories/contracts/money-market/NormalInterestRateModel__factory";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export async function deployNirmFixture(): Promise<{ nirm: NormalInterestRateModel }> {
  // Signers declaration
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];

  // Deploy interest rate model
  const nirmFactory: NormalInterestRateModel__factory = await ethers.getContractFactory("NormalInterestRateModel");
  const nirm = <NormalInterestRateModel>await nirmFactory.connect(admin).deploy(mantissa("0.03"), mantissa("0.2"));
  await nirm.deployed();

  return { nirm };
}
