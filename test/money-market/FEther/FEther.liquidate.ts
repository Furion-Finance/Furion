import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export function liquidateTest(): void {
  describe("Liquidate borrowed ETH", async function () {
    let bob: SignerWithAddress;
    let alice: SignerWithAddress;

    before(async function () {
      const signers: SignerWithAddress[] = await ethers.getSigners();
      bob = signers[1];
      alice = signers[2];
    });

    const ethSupplied: BigNumber = mantissa("5"); // 5 ETH
    // Borrower fETH balance before liquidation
    let fethBalancePreLiquidationBob: BigNumber;
    // Borrow max amount possible
    const borrowAmount: BigNumber = ethSupplied.mul(85).div(100); // 4.25 ETH
    const repayAmount: BigNumber = mantissa("2"); // 2 ETH
    const repayAmountSmall: BigNumber = mantissa("0.1"); // 0.1 ETH
    let liquidateTimestamp: number;
    let seizeTokens: BigNumber;
    // Price of ETH in terms of ETH
    const ethPriceMantissa: BigNumber = mantissa("1");

    beforeEach(async function () {
      // Supply 5 ETH before each test
      await this.feth.connect(bob).supply({ value: ethSupplied });
      fethBalancePreLiquidationBob = await this.feth.balanceOf(bob.address);

      // Borrow 4.25 ETH before each test
      await this.feth.connect(bob).borrow(borrowAmount);

      // Mine 1 block using accrueInterest() function
      await this.feth.accrueInterest();
    });

    it("should succeed", async function () {
      // Mark Bob's account as liquidatable, mining the 2nd block
      await this.rm.connect(alice).initiateLiquidation(bob.address);

      // Alice liquidates Bob's borrow with 5% discount, mining the 3rd block
      await expect(this.feth.connect(alice).liquidateBorrow(bob.address, this.feth.address, { value: repayAmount }))
        .to.emit(this.feth, "LiquidateBorrow")
        .withArgs(alice.address, bob.address, repayAmount, this.feth.address);

      // Get exchange rate where block number is same as when liquidateBorrow() is called
      const exchangeRateMantissa: BigNumber = await this.feth.exchangeRateStored();
      // repayAmountAfterDiscount * ethPrice (in terms of ETH)
      const seizeValue: BigNumber = repayAmount.mul(105).div(100).mul(1);
      const valuePerTokenMantissa: BigNumber = ethPriceMantissa.mul(exchangeRateMantissa).div(mantissa("1"));
      seizeTokens = seizeValue.mul(mantissa("1")).div(valuePerTokenMantissa);

      // Seized tokens escrowed in fETH contract, as liquidation protection is triggered
      expect(await this.feth.balanceOf(bob.address)).to.equal(fethBalancePreLiquidationBob.sub(seizeTokens));
      expect(await this.feth.balanceOf(this.feth.address)).to.equal(seizeTokens);
      // Liquidation closed as shortfall is cleared
      expect(await this.rm.liquidatableTime(bob.address)).to.equal(0);
    });

    it("should succeed with higher liquidation discount", async function () {
      // Mark Bob's account as liquidatable, mining the 2nd block
      await this.rm.connect(alice).initiateLiquidation(bob.address);
      // Mine 15 blocks, expect discount to be 18/10 = 1.8 -> 5 + 1 = 6%
      await hre.network.provider.send("hardhat_mine", [ethers.utils.hexValue(15)]);
      // Alice liquidates Bob's borrow with 6% discount, mining the 18th block
      await this.feth.connect(alice).liquidateBorrow(bob.address, this.feth.address, { value: repayAmount });

      // Get exchange rate where block number is same as when liquidateBorrow() is called
      const exchangeRateMantissa: BigNumber = await this.feth.exchangeRateStored();
      // repayAmountAfterDiscount * ethPrice (in terms of ETH)
      const seizeValue: BigNumber = repayAmount.mul(106).div(100).mul(1);
      const valuePerTokenMantissa: BigNumber = ethPriceMantissa.mul(exchangeRateMantissa).div(mantissa("1"));
      seizeTokens = seizeValue.mul(mantissa("1")).div(valuePerTokenMantissa);

      // Seized tokens escrowed in fETH contract, as liquidation protection is triggered
      expect(await this.feth.balanceOf(bob.address)).to.equal(fethBalancePreLiquidationBob.sub(seizeTokens));
      expect(await this.feth.balanceOf(this.feth.address)).to.equal(seizeTokens);
    });

    it("should succeed with auction reset", async function () {
      // Mark Bob's account as liquidatable, mining the 2nd block
      await this.rm.connect(alice).initiateLiquidation(bob.address);
      // Mine 60 blocks
      await hre.network.provider.send("hardhat_mine", [ethers.utils.hexValue(60)]);
      // Reset auction as 60 blocks has passed since last initiation
      await this.rm.connect(alice).initiateLiquidation(bob.address);
      // Repay ETH and seize fETH
      await this.feth.connect(alice).liquidateBorrow(bob.address, this.feth.address, { value: repayAmount });

      // Get exchange rate where block number is same as when liquidateBorrow() is called
      const exchangeRateMantissa: BigNumber = await this.feth.exchangeRateStored();
      const valuePerCollateralTokenMantissa: BigNumber = ethPriceMantissa.mul(exchangeRateMantissa).div(mantissa("1"));
      // repayAmountAfterDiscount * ethPrice (in terms of ETH)
      const seizeValue: BigNumber = repayAmount.mul(105).div(100).mul(ethPriceMantissa).div(mantissa("1"));
      // Amount of fETH to seize
      seizeTokens = seizeValue.mul(mantissa("1")).div(valuePerCollateralTokenMantissa);

      // Seized fETH escrowed in fETH market contract
      expect(await this.feth.balanceOf(this.feth.address)).to.equal(seizeTokens);
      expect(await this.feth.balanceOf(bob.address)).to.equal(fethBalancePreLiquidationBob.sub(seizeTokens));
      // Liquidation closed as shortfall is cleared
      expect(await this.rm.liquidatableTime(bob.address)).to.equal(0);
    });

    it("should succeed with shortfall reduced but not cleared", async function () {
      // Mine 999996 blocks, and accrue interest which mines the 999998th block
      await hre.network.provider.send("hardhat_mine", [ethers.utils.hexValue(999996)]);
      await this.feth.accrueInterest();

      // Mark Bob's account as liquidatable, mining the 999999th block
      await this.rm.connect(alice).initiateLiquidation(bob.address);
      const initiateBlockNumber: number = await ethers.provider.getBlockNumber();

      // Alice liquidates Bob's borrow with 5% discount, mining the 1000000th block
      await this.feth.connect(alice).liquidateBorrow(bob.address, this.feth.address, { value: repayAmountSmall });
      // Liquidation continues as shortfall is not cleared
      expect(await this.rm.liquidatableTime(bob.address)).to.equal(initiateBlockNumber);
    });

    it("should fail with auction not yet initiated", async function () {
      await expect(
        this.feth.connect(alice).liquidateBorrow(bob.address, this.feth.address, { value: repayAmount }),
      ).to.be.revertedWith("RiskManager: Liquidation not yet initiated");
    });

    it("should fail with auction expired", async function () {
      // Mark Bob's account as liquidatable, mining the 2nd block
      await this.rm.connect(alice).initiateLiquidation(bob.address);

      // Mine 60 blocks
      await hre.network.provider.send("hardhat_mine", [ethers.utils.hexValue(60)]);

      await expect(
        this.feth.connect(alice).liquidateBorrow(bob.address, this.feth.address, { value: repayAmount }),
      ).to.be.revertedWith("RiskManager: Reset auction required");
    });

    it("should fail with no shortfall", async function () {
      // Mark Bob's account as liquidatable, mining the 2nd block
      await this.rm.connect(alice).initiateLiquidation(bob.address);

      // Bob repays 0.2 ETH, clearing shortfall
      await this.feth.connect(bob).repayBorrow({ value: mantissa("0.2") });

      await expect(
        this.feth.connect(alice).liquidateBorrow(bob.address, this.feth.address, { value: repayAmount }),
      ).to.be.revertedWith("RiskManager: Insufficient shortfall");
    });

    it("should fail with liquidation not starting from highest tier", async function () {
      // Repay 1 ETH
      await this.feth.connect(bob).repayBorrow({ value: mantissa("1") });
      // Borrow 99 FUR (1 ETH = 100 FUR)
      await this.ffur.connect(bob).borrow(mantissa("99"));

      // Mine 100000 blocks to create shortfall
      await hre.network.provider.send("hardhat_mine", [ethers.utils.hexValue(100000)]);
      await this.feth.accrueInterest();
      await this.ffur.accrueInterest();
      await this.rm.connect(alice).initiateLiquidation(bob.address);

      // Alice attempts to liquidate Bob by repaying 40 FUR which is of lower tier than ETH
      await expect(
        this.ffur.connect(alice).liquidateBorrow(bob.address, mantissa("40"), this.feth.address),
      ).to.be.revertedWith("RiskManager: Liquidation should start from highest tier");
    });

    it("should fail with repay amount exceeding close factor limit", async function () {
      // Mark Bob's account as liquidatable, mining the 2nd block
      await this.rm.connect(alice).initiateLiquidation(bob.address);

      const repayAmountFail: BigNumber = mantissa("3"); // 3 ETH > 4.25/2
      await expect(
        this.feth.connect(alice).liquidateBorrow(bob.address, this.feth.address, { value: repayAmountFail }),
      ).to.be.revertedWith("RiskManager: Repay too much");
    });

    context("with liquidation protection", async function () {
      beforeEach(async function () {
        // Mark Bob's account as liquidatable, mining the 2nd block
        await this.rm.connect(alice).initiateLiquidation(bob.address);
        // Alice liquidates Bob's borrow with 5% discount, mining the 3rd block
        await this.feth.connect(alice).liquidateBorrow(bob.address, this.feth.address, { value: repayAmount });

        const blockNumber: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        liquidateTimestamp = block.timestamp;

        // Get exchange rate where block number is same as when liquidateBorrow() is called
        const exchangeRateMantissa: BigNumber = await this.feth.exchangeRateStored();
        // repayAmountAfterDiscount * ethPrice (in terms of ETH)
        const seizeValue: BigNumber = repayAmount.mul(105).div(100).mul(1);
        const valuePerTokenMantissa: BigNumber = ethPriceMantissa.mul(exchangeRateMantissa).div(mantissa("1"));
        seizeTokens = seizeValue.mul(mantissa("1")).div(valuePerTokenMantissa);
      });

      it("should succeed with correct data", async function () {
        // Check liquidation protection
        const lp = await this.feth.liquidationProtection(liquidateTimestamp);

        expect(lp[0]).to.equal(bob.address);
        expect(lp[1]).to.equal(alice.address);
        // repayValue = repayAmount * ethPrice (in terms of ETH)
        expect(lp[2]).to.equal(repayAmount.mul(1));
        expect(lp[3]).to.equal(seizeTokens);
      });

      it("should succeed with liquidator claiming after time limit", async function () {
        // Fast forward to 24 hours and 1 sec after liquidation protection is triggered
        await ethers.provider.send("evm_mine", [liquidateTimestamp + 24 * 3600 + 1]);

        await this.feth.connect(alice).claimLiquidation(liquidateTimestamp);

        // Check contract and liquidator fETH balance
        expect(await this.feth.balanceOf(this.feth.address)).to.equal(0);
        expect(await this.feth.balanceOf(alice.address)).to.equal(seizeTokens);
      });

      it("should fail with liquidator claiming before time limit", async function () {
        // Fast forward to 5 hours after liquidation protection is triggered
        await ethers.provider.send("evm_mine", [liquidateTimestamp + 5 * 3600]);

        await expect(this.feth.connect(alice).claimLiquidation(liquidateTimestamp)).to.be.revertedWith(
          "TokenBase: Time limit not passed",
        );
      });

      it("should fail with non-liquidator claiming", async function () {
        // Fast forward to 24 hours and 1 sec after liquidation protection is triggered
        await ethers.provider.send("evm_mine", [liquidateTimestamp + 24 * 3600 + 1]);

        await expect(this.feth.connect(bob).claimLiquidation(liquidateTimestamp)).to.be.revertedWith(
          "TokenBase: Not liquidator of this liquidation",
        );
      });

      it("should succeed with borrower repaying at 1.2x price using ETH within time limit", async function () {
        // Fast forward to 1 min after liquidation protection is triggered
        await ethers.provider.send("evm_mine", [liquidateTimestamp + 60]);

        const claimRepayAmount: BigNumber = repayAmount.mul(120).div(100);
        await expect(
          await this.feth.connect(bob).repayLiquidationWithEth(liquidateTimestamp, { value: claimRepayAmount }),
        ).to.changeEtherBalance(alice, claimRepayAmount);

        // Check contract and borrower fETH balance
        expect(await this.feth.balanceOf(this.feth.address)).to.equal(0);
        expect(await this.feth.balanceOf(bob.address)).to.equal(fethBalancePreLiquidationBob);
      });

      it("should fail with borrower repaying after time limit", async function () {
        // Fast forward to 24 hours and 1 sec after liquidation protection is triggered
        await ethers.provider.send("evm_mine", [liquidateTimestamp + 24 * 3600 + 1]);

        const claimRepayAmount: BigNumber = repayAmount.mul(120).div(100);
        await expect(
          this.feth.connect(bob).repayLiquidationWithEth(liquidateTimestamp, { value: claimRepayAmount }),
        ).to.be.revertedWith("TokenBase: Time limit passed");
      });

      it("should fail with borrower repaying at less than 1.2x price", async function () {
        // Fast forward to 1 min after liquidation protection is triggered
        await ethers.provider.send("evm_mine", [liquidateTimestamp + 60]);

        // Only 1.1x
        const claimRepayAmount: BigNumber = repayAmount.mul(110).div(100);
        await expect(
          this.feth.connect(bob).repayLiquidationWithEth(liquidateTimestamp, { value: claimRepayAmount }),
        ).to.be.revertedWith("TokenBase: Not enough ETH given");
      });
    });
  });
}
