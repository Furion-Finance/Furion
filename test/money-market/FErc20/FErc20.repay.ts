import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";

import { mineBlocks } from "../../utils";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export function repayTest(): void {
  describe("Repay borrowed F-NFT including interest", async function () {
    let bob: SignerWithAddress;
    let alice: SignerWithAddress;

    before(async function () {
      const signers: SignerWithAddress[] = await ethers.getSigners();
      bob = signers[1];
      alice = signers[2];
    });

    // F-NFT balance
    let spBalanceBob: BigNumber = mantissa("4000");
    const spBalanceAlice: BigNumber = mantissa("2000");
    // Supply 3000 F-NFT and mint fF-NFT
    const spSupplied: BigNumber = mantissa("3000");
    const borrowAmount: BigNumber = mantissa("500"); // 500 F-NFT
    let newBorrowBalance: BigNumber;

    beforeEach(async function () {
      // Supply 3000 F-NFT before each test
      await this.ferc.connect(bob).supply(spSupplied);
      // Borrow 500 F-NFT before each test
      await this.ferc.connect(bob).borrow(borrowAmount);
      spBalanceBob = await this.sp.balanceOf(bob.address);

      const borrowRatePerBlockMantissa: BigNumber = await this.ferc.borrowRatePerBlock();
      // 2102400 is the no. of blocks in a year according to interest rate model
      const borrowRatePerYearMantissa: BigNumber = borrowRatePerBlockMantissa.mul(2102400);
      const oldBorrowIndex: BigNumber = await this.ferc.borrowIndex();
      const multiplierMantissa: BigNumber = borrowRatePerYearMantissa.add(mantissa("1"));
      const newBorrowIndex: BigNumber = oldBorrowIndex.mul(multiplierMantissa).div(mantissa("1"));
      // Borrow balance after 1 year
      newBorrowBalance = borrowAmount.mul(newBorrowIndex).div(oldBorrowIndex);

      // Mine 2102399 blocks
      await mineBlocks(2102399);
    });

    it("should succeed with repayer being borrower", async function () {
      // Repay whole borrow balance
      const repayAmount: BigNumber = newBorrowBalance;
      await expect(this.ferc.connect(bob).repayBorrow(repayAmount))
        .to.emit(this.ferc, "RepayBorrow")
        .withArgs(bob.address, bob.address, repayAmount, 0, 0);

      expect(await this.sp.balanceOf(bob.address)).to.equal(spBalanceBob.sub(repayAmount));
      expect(await this.ferc.borrowBalanceCurrent(bob.address)).to.equal(0);
      expect(await this.ferc.totalBorrows()).to.equal(0);
    });

    it("should succeed with repayer being non-borrower", async function () {
      // Repay whole borrow balance
      const repayAmount: BigNumber = newBorrowBalance;
      await expect(this.ferc.connect(alice).repayBorrowBehalf(bob.address, repayAmount))
        .to.emit(this.ferc, "RepayBorrow")
        .withArgs(alice.address, bob.address, repayAmount, 0, 0);

      expect(await this.sp.balanceOf(alice.address)).to.equal(spBalanceAlice.sub(repayAmount));
      expect(await this.ferc.borrowBalanceCurrent(bob.address)).to.equal(0);
      expect(await this.ferc.totalBorrows()).to.equal(0);
    });

    it("should succeed with partial repayment", async function () {
      // Repay 200 F-NFT
      const repayAmount: BigNumber = mantissa("200");
      const borrowBalanceAfterRepay: BigNumber = newBorrowBalance.sub(repayAmount);
      await expect(this.ferc.connect(bob).repayBorrow(repayAmount))
        .to.emit(this.ferc, "RepayBorrow")
        .withArgs(bob.address, bob.address, repayAmount, borrowBalanceAfterRepay, borrowBalanceAfterRepay);

      expect(await this.sp.balanceOf(bob.address)).to.equal(spBalanceBob.sub(repayAmount));
      expect(await this.ferc.borrowBalanceCurrent(bob.address)).to.equal(borrowBalanceAfterRepay);
      expect(await this.ferc.totalBorrows()).to.equal(borrowBalanceAfterRepay);
    });
  });
}
