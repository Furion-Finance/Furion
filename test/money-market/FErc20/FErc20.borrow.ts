import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export function borrowTest(): void {
  describe("Borrow F-NFT by using fF-NFT as collateral", async function () {
    let bob: SignerWithAddress;
    //let alice: SignerWithAddress;

    before(async function () {
      const signers: SignerWithAddress[] = await ethers.getSigners();
      bob = signers[1];
      //alice = signers[2];
    });

    // F-NFT balance
    let spBalanceBob: BigNumber = mantissa("4000");
    // Supply 3000 F-NFT and mint fF-NFT
    const spSupplied: BigNumber = mantissa("3000");
    const borrowAmount: BigNumber = mantissa("1000"); // 1000 F-NFT
    const cashNew: BigNumber = spSupplied.sub(borrowAmount);

    beforeEach(async function () {
      // Supply 5 ETH before each test
      await this.ferc.connect(bob).supply(spSupplied);
      spBalanceBob = await this.sp.balanceOf(bob.address);
    });

    it("should succeed with borrow amount within collateral factor limit", async function () {
      // F-NFT market is automatically entered
      await expect(this.ferc.connect(bob).borrow(borrowAmount))
        .to.emit(this.ferc, "Borrow")
        .withArgs(bob.address, borrowAmount, borrowAmount, borrowAmount);
      spBalanceBob = spBalanceBob.add(borrowAmount);

      expect(await this.sp.balanceOf(bob.address)).to.equal(spBalanceBob);
      expect(await this.ferc.totalBorrows()).to.equal(borrowAmount);
      expect(await this.ferc.totalCash()).to.equal(cashNew);
    });

    it("should fail with borrow amount greater than collateral factor limit", async function () {
      // F-NFT collateral factor = 0.4 = 40/100
      // Max borrow: 3000 * 0.4 = 1200 F-NFT
      const maxBorrow: BigNumber = spSupplied.mul(40).div(100);

      // Attempt to borrow 1201 F-NFT
      await expect(this.ferc.connect(bob).borrow(maxBorrow.add(mantissa("1")))).to.be.revertedWith(
        "RiskManager: Shortfall created, cannot borrow",
      );
    });

    it("should fail with existing shortfall", async function () {
      // F-NFT collateral factor = 0.4 = 40/100
      // Max borrow: 3000 * 0.4 = 1200 F-NFT
      const maxBorrow: BigNumber = spSupplied.mul(40).div(100);
      await this.ferc.connect(bob).borrow(maxBorrow);

      // Accrue interest which creates shortfall
      await this.ferc.accrueInterest();

      // Attempt to borrow 1 F-NFT
      await expect(this.ferc.connect(bob).borrow(mantissa("1"))).to.be.revertedWith(
        "RiskManager: Shortfall created, cannot borrow",
      );
    });

    it("should fail with attempt to borrow higher tier assets (ETH)", async function () {
      // Attempt to borrow 1 ETH
      await expect(this.feth.borrow(mantissa("1"))).to.be.revertedWith("RiskManager: Shortfall created, cannot borrow");
    });

    it("should accrue interest every block", async function () {
      await this.ferc.connect(bob).borrow(borrowAmount);

      const borrowRatePerBlockMantissa: BigNumber = await this.ferc.borrowRatePerBlock();
      // 2102400 is the no. of blocks in a year according to interest rate model
      const borrowRatePerYearMantissa: BigNumber = borrowRatePerBlockMantissa.mul(2102400);
      const oldBorrowIndex: BigNumber = await this.ferc.borrowIndex();
      const multiplierMantissa: BigNumber = borrowRatePerYearMantissa.add(mantissa("1"));
      const calNewBorrowIndex: BigNumber = oldBorrowIndex.mul(multiplierMantissa).div(mantissa("1"));

      // Mine 2102399 blocks and update market
      await hre.network.provider.send("hardhat_mine", [ethers.utils.hexValue(2102399)]);
      // Update market state, making no. of blocks mined 2102400
      await this.ferc.accrueInterest();

      // Get new borrow balance
      const newBorrowIndex: BigNumber = await this.ferc.borrowIndex();
      expect(newBorrowIndex).to.equal(calNewBorrowIndex);
    });
  });
}
