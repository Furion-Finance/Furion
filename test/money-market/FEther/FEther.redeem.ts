import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export function redeemTest(): void {
  describe("Redeem ETH by burning fETH", async function () {
    let bob: SignerWithAddress;

    before(async function () {
      const signers: SignerWithAddress[] = await ethers.getSigners();
      bob = signers[1];
    });

    // Supply 5 ETH and mint fETH
    const ethSupplied: BigNumber = mantissa("5"); // 5 ETH
    let tokenBalance: BigNumber;
    // Burn 1/5 of fETH owned to redeem ETH
    // ETH redeemed is also 1/5 of ethSupplied because there is no interest accrued
    const redeemAmount: BigNumber = ethSupplied.div(5); // 1 ETH
    let redeemTokens: BigNumber;
    // Amount of ETH remaining in market after redemption
    const cashNew: BigNumber = ethSupplied.sub(redeemAmount);

    beforeEach(async function () {
      // Supply 5 ETH before each test
      await this.feth.connect(bob).supply({ value: mantissa("5") });
      tokenBalance = await this.feth.balanceOf(bob.address);
      redeemTokens = tokenBalance.div(5);
    });

    it("should succeed with amount of fETH to burn provided", async function () {
      // Burn amount of fETH provided to redeem ETH
      // Check for event first to avoid result mismatch due to interest accrual
      await expect(this.feth.connect(bob).redeem(redeemTokens))
        .to.emit(this.feth, "Redeem")
        .withArgs(bob.address, redeemAmount, redeemTokens);
      tokenBalance = tokenBalance.sub(redeemTokens);

      expect(await this.feth.totalCash()).to.equal(cashNew);
      expect(await this.feth.balanceOf(bob.address)).to.equal(tokenBalance);

      // Check for ETH credited to wallet from redeeming
      await expect(await this.feth.connect(bob).redeem(redeemTokens)).to.changeEtherBalance(bob, redeemAmount);
    });

    it("should succeed with amount of ETH to redeem provided", async function () {
      // Disable mining immediately upon receiving tx
      // Check for event first to avoid result mismatch due to interest accrual
      await expect(this.feth.connect(bob).redeemUnderlying(redeemAmount))
        .to.emit(this.feth, "Redeem")
        .withArgs(bob.address, redeemAmount, redeemTokens);
      tokenBalance = tokenBalance.sub(redeemTokens);

      expect(await this.feth.totalCash()).to.equal(cashNew);
      expect(await this.feth.balanceOf(bob.address)).to.equal(tokenBalance);

      // Check for ETH credited to wallet from redeeming
      await expect(await this.feth.connect(bob).redeemUnderlying(redeemAmount)).to.changeEtherBalance(
        bob,
        redeemAmount,
      );
    });

    it("should fail with redeem amount greater than amount supplied", async function () {
      await expect(this.feth.connect(bob).redeemUnderlying(ethSupplied.add(1))).to.be.reverted;
    });

    it("should fail with redeem amount greater than or equal to cash in market", async function () {
      await expect(this.feth.connect(bob).redeemUnderlying(ethSupplied)).to.be.revertedWith(
        "TokenBase: Market has insufficient cash",
      );
    });

    it("should fail with redemption causing shortfall", async function () {
      // Borrow 4 ETH
      await this.feth.connect(bob).borrow(mantissa("4"));

      // Attempt to redeem 1 ETH
      await expect(this.feth.connect(bob).redeemUnderlying(redeemAmount)).to.be.revertedWith(
        "RiskManager: Insufficient liquidity",
      );
    });
  });
}
