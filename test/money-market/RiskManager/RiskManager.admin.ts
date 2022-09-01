import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export function adminTest(): void {
  describe("Admin Functions", function () {
    let admin: SignerWithAddress;
    let bob: SignerWithAddress;

    before(async function () {
      const signers: SignerWithAddress[] = await ethers.getSigners();
      admin = signers[0];
      bob = signers[1];
    });

    it("should deploy correctly", async function () {
      expect(await this.rm.admin()).to.equal(admin.address);
    });

    it("should only allow admin to list markets", async function () {
      // Non-admin tries to list fETH market
      await expect(this.rm.connect(bob).supportMarket(this.feth.address, mantissa("0.85"), 1)).to.be.revertedWith(
        "RiskManager: Not authorized to call",
      );

      // Admin lists fETH market with 0.85 collateral factor and as tier 1
      await expect(this.rm.connect(admin).supportMarket(this.feth.address, mantissa("0.85"), 1))
        .to.emit(this.rm, "MarketListed")
        .withArgs(this.feth.address);
      expect(await this.rm.checkListed(this.feth.address)).to.equal(true);
    });
  });
}
