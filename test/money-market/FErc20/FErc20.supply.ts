import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

// Initial F-NFT balances:
// bob: 4000
// alice: 2000

export function supplyTest(): void {
  describe("Supply F-NFT to mint fF-NFT", async function () {
    let admin: SignerWithAddress;
    let bob: SignerWithAddress;

    before(async function () {
      const signers: SignerWithAddress[] = await ethers.getSigners();
      admin = signers[0];
      bob = signers[1];
    });

    // F-NFT balance
    let spBalanceBob: BigNumber = mantissa("4000");
    // F-NFT supplied
    const spSupplied: BigNumber = mantissa("3000");
    // Initial exchange rate is 1 fToken = 50 underlying
    const calMintAmount: BigNumber = spSupplied.div(50);

    it("should succeed", async function () {
      // Bob supplies 3000 F-NFT to get fF-NFT
      // Check for event first to avoid result mismatch due to interest accrual
      await expect(this.ferc.connect(bob).supply(spSupplied))
        .to.emit(this.ferc, "Supply")
        .withArgs(bob.address, spSupplied, calMintAmount);
      spBalanceBob = spBalanceBob.sub(spSupplied);

      expect(await this.sp.balanceOf(bob.address)).to.equal(spBalanceBob);
      expect(await this.ferc.balanceOf(bob.address)).to.equal(calMintAmount);
      expect(await this.ferc.totalSupply()).to.equal(calMintAmount);
      expect(await this.ferc.totalCash()).to.equal(spSupplied);
    });

    it("should fail when supply is paused", async function () {
      // Admin pauses supply function of ferc market
      await this.rm.connect(admin).setSupplyPaused(this.ferc.address, true);

      await expect(this.ferc.connect(bob).supply(spSupplied)).to.be.revertedWith("RiskManager: Supplying is paused");
    });
  });
}
