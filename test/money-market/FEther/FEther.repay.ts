import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";

import { mineBlocks } from "../../utils";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export function repayTest(): void {
  describe("Repay borrowed ETH including interest", async function () {
    let bob: SignerWithAddress;
    let alice: SignerWithAddress;

    before(async function () {
      const signers: SignerWithAddress[] = await ethers.getSigners();
      bob = signers[1];
      alice = signers[2];
    });

    // Supply 5 ETH and mint fETH
    const ethSupplied: BigNumber = mantissa("5"); // 5 ETH
    const borrowAmount: BigNumber = mantissa("1"); // 1 ETH
    let newBorrowBalance: BigNumber;

    beforeEach(async function () {
      // Supply 5 ETH before each test
      await this.feth.connect(bob).supply({ value: ethSupplied });
      // Borrow 1 ETH before each test
      await this.feth.connect(bob).borrow(borrowAmount);

      const borrowRatePerBlockMantissa: BigNumber = await this.feth.borrowRatePerBlock();
      // 2102400 is the no. of blocks in a year according to interest rate model
      const borrowRatePerYearMantissa: BigNumber = borrowRatePerBlockMantissa.mul(2102400);
      const oldBorrowIndex: BigNumber = await this.feth.borrowIndex();
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
      await expect(this.feth.connect(bob).repayBorrow({ value: repayAmount }))
        .to.emit(this.feth, "RepayBorrow")
        .withArgs(bob.address, bob.address, repayAmount, 0, 0);

      expect(await this.feth.borrowBalanceCurrent(bob.address)).to.equal(0);
      expect(await this.feth.totalBorrows()).to.equal(0);
    });

    it("should succeed with repayer not being borrower", async function () {
      // Repay whole borrow balance
      const repayAmount: BigNumber = newBorrowBalance;
      await expect(this.feth.connect(alice).repayBorrowBehalf(bob.address, { value: repayAmount }))
        .to.emit(this.feth, "RepayBorrow")
        .withArgs(alice.address, bob.address, repayAmount, 0, 0);

      expect(await this.feth.borrowBalanceCurrent(bob.address)).to.equal(0);
      expect(await this.feth.totalBorrows()).to.equal(0);
    });

    it("should succeed with borrow balance not fully repaid", async function () {
      // Repay 1 ETH
      const repayAmount: BigNumber = mantissa("1");
      const borrowBalanceAfterRepay: BigNumber = newBorrowBalance.sub(repayAmount);
      await expect(this.feth.connect(bob).repayBorrow({ value: repayAmount }))
        .to.emit(this.feth, "RepayBorrow")
        .withArgs(bob.address, bob.address, repayAmount, borrowBalanceAfterRepay, borrowBalanceAfterRepay);

      expect(await this.feth.borrowBalanceCurrent(bob.address)).to.equal(borrowBalanceAfterRepay);
      expect(await this.feth.totalBorrows()).to.equal(borrowBalanceAfterRepay);
    });
  });
}
