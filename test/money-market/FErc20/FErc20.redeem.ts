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

export function redeemTest(): void {
  describe("Redeem F-NFT by burning fF-NFT", async function () {
    let bob: SignerWithAddress;

    before(async function () {
      const signers: SignerWithAddress[] = await ethers.getSigners();
      bob = signers[1];
    });

    // F-NFT balance
    let spBalanceBob: BigNumber = mantissa("4000");
    // Supply 3000 F-NFT and mint fF-NFT
    const spSupplied: BigNumber = mantissa("3000");
    // fF-NFT balance
    let tokenBalanceBob: BigNumber;
    // Burn half of fF-NFT owned to redeem F-NFT
    // F-NFT redeemed is also half of spSupplied because there is no interest accrued
    const redeemAmount: BigNumber = spSupplied.div(2); // 1500 F-NFT
    let redeemTokens: BigNumber;
    let tokenSupply: BigNumber;
    // Amount of F-NFT remaining in market after redemption
    const cashNew: BigNumber = spSupplied.sub(redeemAmount);

    beforeEach(async function () {
      // Supply 3000 F-NFT before each test
      await this.ferc.connect(bob).supply(spSupplied);
      spBalanceBob = await this.sp.balanceOf(bob.address);
      tokenBalanceBob = await this.ferc.balanceOf(bob.address);
      redeemTokens = tokenBalanceBob.div(2);
      tokenSupply = await this.ferc.totalSupply();
    });

    it("should succeed with amount of fF-NFT to burn provided", async function () {
      // Burn amount of fETH provided to redeem ETH
      // Check for event first to avoid result mismatch due to interest accrual
      await expect(this.ferc.connect(bob).redeem(redeemTokens))
        .to.emit(this.ferc, "Redeem")
        .withArgs(bob.address, redeemAmount, redeemTokens);
      spBalanceBob = spBalanceBob.add(redeemAmount);
      tokenBalanceBob = tokenBalanceBob.sub(redeemTokens);
      tokenSupply = tokenSupply.sub(redeemTokens);

      expect(await this.sp.balanceOf(bob.address)).to.equal(spBalanceBob);
      expect(await this.ferc.balanceOf(bob.address)).to.equal(tokenBalanceBob);
      expect(await this.ferc.totalCash()).to.equal(cashNew);
      expect(await this.ferc.totalSupply()).to.equal(tokenSupply);
    });

    it("should succeed with amount of ETH to redeem provided", async function () {
      // Check for event first to avoid result mismatch due to interest accrual
      await expect(this.ferc.connect(bob).redeemUnderlying(redeemAmount))
        .to.emit(this.ferc, "Redeem")
        .withArgs(bob.address, redeemAmount, redeemTokens);
      spBalanceBob = spBalanceBob.add(redeemAmount);
      tokenBalanceBob = tokenBalanceBob.sub(redeemTokens);
      tokenSupply = tokenSupply.sub(redeemTokens);

      //expect(await this.sp.balanceOf(bob.address)).to.equal(spBalanceBob);
      expect(await this.ferc.balanceOf(bob.address)).to.equal(tokenBalanceBob);
      expect(await this.ferc.totalCash()).to.equal(cashNew);
      expect(await this.ferc.totalSupply()).to.equal(tokenSupply);
    });

    it("should fail with redeem amount greater than or equal to cash in market", async function () {
      await expect(this.ferc.connect(bob).redeemUnderlying(spSupplied)).to.be.revertedWith(
        "TokenBase: Market has insufficient cash",
      );
    });

    it("should fail with redemption causing shortfall", async function () {
      // Borrow 1100 F-NFT
      await this.ferc.connect(bob).borrow(mantissa("1100"));

      // Attempt to redeem 1500 F-NFT
      await expect(this.ferc.connect(bob).redeemUnderlying(redeemAmount)).to.be.revertedWith(
        "RiskManager: Insufficient liquidity",
      );
    });
  });
}
