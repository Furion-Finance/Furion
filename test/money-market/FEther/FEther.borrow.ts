import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export function borrowTest(): void {
  describe("Borrow ETH by using ETH as collateral", async function () {
    let bob: SignerWithAddress;

    before(async function () {
      const signers: SignerWithAddress[] = await ethers.getSigners();
      bob = signers[1];
    });

    const ethSupplied: BigNumber = mantissa("5"); // 5 ETH
    const borrowAmount: BigNumber = mantissa("1"); // 1 ETH
    const cashNew: BigNumber = ethSupplied.sub(borrowAmount);

    beforeEach(async function () {
      // Supply 5 ETH before each test
      await this.feth.connect(bob).supply({ value: ethSupplied });
    });

    it("should succeed", async function () {
      // ETH market is automatically entered
      // Check for event first to avoid result mismatch due to interest accrual
      await expect(this.feth.connect(bob).borrow(borrowAmount))
        .to.emit(this.feth, "Borrow")
        .withArgs(bob.address, borrowAmount, borrowAmount, borrowAmount);

      expect(await this.feth.totalBorrows()).to.equal(borrowAmount);
      expect(await this.feth.totalCash()).to.equal(cashNew);

      // Check for ETH credited to wallet from borrowing
      await expect(await this.feth.connect(bob).borrow(borrowAmount)).to.changeEtherBalance(bob, borrowAmount);
    });

    it("should fail with borrow amount greater than collateral factor limit", async function () {
      // ETH collateral factor = 0.85 = 85/100
      const maxBorrow: BigNumber = ethSupplied.mul(85).div(100);

      await expect(this.feth.connect(bob).borrow(maxBorrow.add(1))).to.be.revertedWith(
        "RiskManager: Shortfall created, cannot borrow",
      );
    });

    it("should fail with existing shortfall", async function () {
      // ETH collateral factor = 0.85 = 85/100
      const maxBorrow: BigNumber = ethSupplied.mul(85).div(100);
      await this.feth.connect(bob).borrow(maxBorrow);

      // Accrue interest which creates shortfall
      await this.feth.accrueInterest();

      // Attempt to borrow 0.1 ETH
      await expect(this.feth.connect(bob).borrow(mantissa("0.1"))).to.be.revertedWith(
        "RiskManager: Shortfall created, cannot borrow",
      );
    });

    it("should accrue interest every block", async function () {
      await this.feth.connect(bob).borrow(borrowAmount);

      const borrowRatePerBlockMantissa: BigNumber = await this.feth.borrowRatePerBlock();
      // 2102400 is the no. of blocks in a year according to interest rate model
      const borrowRatePerYearMantissa: BigNumber = borrowRatePerBlockMantissa.mul(2102400);
      const oldBorrowIndex: BigNumber = await this.feth.borrowIndex();
      const multiplierMantissa: BigNumber = borrowRatePerYearMantissa.add(mantissa("1"));
      const calNewBorrowIndex: BigNumber = oldBorrowIndex.mul(multiplierMantissa).div(mantissa("1"));

      // Mine 2102399 blocks and update market
      await hre.network.provider.send("hardhat_mine", [ethers.utils.hexValue(2102399)]);
      // Update market state, making no. of blocks mined 2102400
      await this.feth.accrueInterest();

      // Get new borrow balance
      const newBorrowIndex: BigNumber = await this.feth.borrowIndex();
      expect(newBorrowIndex).to.equal(calNewBorrowIndex);
    });
  });
}
