import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";

import { mineBlocks } from "../../utils";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export function liquidateTest(): void {
  describe("Liquidate borrowed F-NFT", async function () {
    let admin: SignerWithAddress;
    let bob: SignerWithAddress;
    let alice: SignerWithAddress;

    before(async function () {
      const signers: SignerWithAddress[] = await ethers.getSigners();
      admin = signers[0];
      bob = signers[1];
      alice = signers[2];
    });

    let spBalanceBob: BigNumber = mantissa("4000"); // 4000 F-NFT
    const spBalanceAlice: BigNumber = mantissa("2000"); // 2000 F-NFT
    const spSupplied: BigNumber = mantissa("3000"); // 3000 F-NFT
    const ethSupplied: BigNumber = mantissa("5"); // 5 ETH
    // Borrower fETH balance before liquidation
    let fethBalancePreLiquidationBob: BigNumber;
    // Borrower fF-NFT balance before liquidation;
    let fspBalancePreLiquidationBob: BigNumber;
    // Borrow max amount possible: 3000 * 0.6 + 500 * 0.85 = 2225 F-NFT
    const borrowAmount: BigNumber = spSupplied.mul(60).div(100).add(ethSupplied.mul(100).mul(85).div(100));
    //let newBorrowBalance: BigNumber;
    const repayAmount: BigNumber = mantissa("400"); // 400 F-NFT
    const repayAmountSmall: BigNumber = mantissa("100"); // 100 F-NFT
    // fETH tokens seized
    let seizeTokens: BigNumber;
    let liquidateTimestamp: number;
    let liquidateId: number;
    // Price of ETH in terms of ETH
    const ethPriceMantissa: BigNumber = mantissa("1700");
    // Price of fF-NFT in terms of ETH
    const priceMantissa: BigNumber = mantissa("17");
    const _mantissa: BigNumber = mantissa("1");

    beforeEach(async function () {
      // Supply 3000 F-NFT and 10 ETH before each test
      await this.ferc.connect(bob).supply(spSupplied);
      fspBalancePreLiquidationBob = await this.ferc.balanceOf(bob.address);
      await this.feth.connect(bob).supply({ value: ethSupplied });
      fethBalancePreLiquidationBob = await this.feth.balanceOf(bob.address);
      // Enter fETH and fF-NFT markets for liquidity calculation
      await this.rm.connect(bob).enterMarkets([this.ferc.address, this.feth.address]);
      // Borrow 2050 F-NFT before each test
      await this.ferc.connect(bob).borrow(borrowAmount);

      spBalanceBob = await this.sp.balanceOf(bob.address);

      /*
      const borrowRatePerBlockMantissa: BigNumber = await this.ferc.borrowRatePerBlock();
      const borrowRatePerYearMantissa: BigNumber = borrowRatePerBlockMantissa.mul(3);
      const oldBorrowIndex: BigNumber = await this.ferc.borrowIndex();
      const multiplierMantissa: BigNumber = borrowRatePerYearMantissa.add(mantissa("1"));
      const newBorrowIndex: BigNumber = oldBorrowIndex.mul(multiplierMantissa).div(mantissa("1"));
      // Borrow balance after 3 blocks
      newBorrowBalance = borrowAmount.mul(newBorrowIndex).div(oldBorrowIndex);
      */
    });

    it("should succeed with fETH seized", async function () {
      // Mark Bob's account as liquidatable, mining the 2nd block
      await this.rm.connect(alice).initiateLiquidation(bob.address);

      // Alice liquidates Bob's borrow and seize ETH collateral with 5% discount
      await expect(this.ferc.connect(alice).liquidateBorrow(bob.address, repayAmount, this.feth.address))
        .to.emit(this.ferc, "LiquidateBorrow")
        .withArgs(alice.address, bob.address, repayAmount, this.feth.address);

      // Get exchange rate where block number is same as when liquidateBorrow() is called
      const exchangeRateMantissa: BigNumber = await this.feth.exchangeRateCurrent();
      const valuePerCollateralTokenMantissa: BigNumber = ethPriceMantissa.mul(exchangeRateMantissa).div(_mantissa);
      // repayAmountAfterDiscount * ethPrice
      const seizeValue: BigNumber = repayAmount.mul(105).div(100).mul(priceMantissa).div(_mantissa);
      // Amount of fETH to seize
      seizeTokens = seizeValue.mul(_mantissa).div(valuePerCollateralTokenMantissa);

      // Seized fETH sent to Alice
      expect(await this.feth.balanceOf(bob.address)).to.equal(fethBalancePreLiquidationBob.sub(seizeTokens));
      expect(await this.feth.balanceOf(alice.address)).to.equal(seizeTokens);
      // Alice's F-NFT balance
      expect(await this.sp.balanceOf(alice.address)).to.equal(spBalanceAlice.sub(repayAmount));
      // Liquidation closed as shortfall is cleared
      expect(await this.rm.liquidatableTime(bob.address)).to.equal(0);
    });

    it("should succeed with fF-NFT seized", async function () {
      // Mark Bob's account as liquidatable, mining the 2nd block
      await this.rm.connect(alice).initiateLiquidation(bob.address);

      // Alice liquidates Bob's borrow and seize F-NFT collateral with 5% discount, mining the 3rd block
      await expect(this.ferc.connect(alice).liquidateBorrow(bob.address, repayAmount, this.ferc.address))
        .to.emit(this.ferc, "LiquidateBorrow")
        .withArgs(alice.address, bob.address, repayAmount, this.ferc.address);

      // Get exchange rate where block number is same as when liquidateBorrow() is called
      const exchangeRateMantissa: BigNumber = await this.ferc.exchangeRateCurrent();
      const valuePerCollateralTokenMantissa: BigNumber = priceMantissa.mul(exchangeRateMantissa).div(mantissa("1"));
      // repayAmountAfterDiscount * F-NFT price (in terms of ETH)
      const seizeValue: BigNumber = repayAmount.mul(105).div(100).mul(priceMantissa).div(mantissa("1"));
      // Amount of fF-NFT to seize
      seizeTokens = seizeValue.mul(mantissa("1")).div(valuePerCollateralTokenMantissa);

      // Seized token is not collateral tier, liquidation protection not triggered
      expect(await this.ferc.balanceOf(bob.address)).to.equal(fspBalancePreLiquidationBob.sub(seizeTokens));
      expect(await this.ferc.balanceOf(alice.address)).to.equal(seizeTokens);
      // Alice's F-NFT balance
      expect(await this.sp.balanceOf(alice.address)).to.equal(spBalanceAlice.sub(repayAmount));
      // Liquidation closed as shortfall is cleared
      expect(await this.rm.liquidatableTime(bob.address)).to.equal(0);
    });

    it("should succeed with higher liquidation discount", async function () {
      // Mark Bob's account as liquidatable
      await this.rm.connect(alice).initiateLiquidation(bob.address);
      // Mine 15 blocks, expect discount to be (15+1)/10 = 1.6 -> 5 + 1 = 6%
      await mineBlocks(15);
      // Alice liquidates Bob's borrow with 6% discount, mining the 18th block
      await this.ferc.connect(alice).liquidateBorrow(bob.address, repayAmount, this.feth.address);

      // Get exchange rate where block number is same as when liquidateBorrow() is called
      const exchangeRateMantissa: BigNumber = await this.feth.exchangeRateCurrent();
      // seizeValue = repayAmountAfterDiscount * F-NFT price (in terms of ETH)
      const seizeValue: BigNumber = repayAmount.mul(106).div(100).mul(priceMantissa).div(_mantissa);
      const valuePerCollateralTokenMantissa: BigNumber = ethPriceMantissa.mul(exchangeRateMantissa).div(_mantissa);
      seizeTokens = seizeValue.mul(_mantissa).div(valuePerCollateralTokenMantissa);

      // Seized tokens sent to Alice
      expect(await this.feth.balanceOf(bob.address)).to.equal(fethBalancePreLiquidationBob.sub(seizeTokens));
      expect(await this.feth.balanceOf(alice.address)).to.equal(seizeTokens);
    });

    it("should succeed with auction reset", async function () {
      // Mark Bob's account as liquidatable, mining the 2nd block
      await this.rm.connect(alice).initiateLiquidation(bob.address);
      // Mine 60 blocks
      await mineBlocks(60);
      // Reset auction as 60 blocks has passed since last initiation
      await this.rm.connect(alice).initiateLiquidation(bob.address);
      // Repay F-NFT and seize fETH
      await this.ferc.connect(alice).liquidateBorrow(bob.address, repayAmount, this.feth.address);

      // Get exchange rate where block number is same as when liquidateBorrow() is called
      const exchangeRateMantissa: BigNumber = await this.feth.exchangeRateCurrent();
      const valuePerCollateralTokenMantissa: BigNumber = ethPriceMantissa.mul(exchangeRateMantissa).div(_mantissa);
      // repayAmountAfterDiscount * ethPrice (in terms of ETH)
      const seizeValue: BigNumber = repayAmount.mul(105).div(100).mul(priceMantissa).div(_mantissa);
      // Amount of fETH to seize
      seizeTokens = seizeValue.mul(_mantissa).div(valuePerCollateralTokenMantissa);

      // Seized fETH sent to Alice
      expect(await this.feth.balanceOf(bob.address)).to.equal(fethBalancePreLiquidationBob.sub(seizeTokens));
      expect(await this.feth.balanceOf(alice.address)).to.equal(seizeTokens);
      // Liquidation closed as shortfall is cleared
      expect(await this.rm.liquidatableTime(bob.address)).to.equal(0);
    });

    it("should succeed with shortfall reduced but not cleared", async function () {
      // Mine 999990 blocks
      await mineBlocks(999990);

      // Mark Bob's account as liquidatable
      await this.rm.connect(alice).initiateLiquidation(bob.address);
      const initiateBlockNumber: number = await ethers.provider.getBlockNumber();

      // Alice liquidates Bob's borrow with 5% discount
      await this.ferc.connect(alice).liquidateBorrow(bob.address, repayAmountSmall, this.feth.address);
      // Liquidation continues as shortfall is not cleared
      expect(await this.rm.liquidatableTime(bob.address)).to.equal(initiateBlockNumber);
    });

    it("should fail with auction not yet initiated", async function () {
      await expect(
        this.ferc.connect(alice).liquidateBorrow(bob.address, repayAmount, this.feth.address),
      ).to.be.revertedWith("RiskManager: Liquidation not yet initiated");
    });

    it("should fail with auction expired", async function () {
      // Mark Bob's account as liquidatable
      await this.rm.connect(alice).initiateLiquidation(bob.address);

      // Mine 60 blocks
      await mineBlocks(60);

      await expect(
        this.ferc.connect(alice).liquidateBorrow(bob.address, repayAmount, this.feth.address),
      ).to.be.revertedWith("RiskManager: Reset auction required");
    });

    it("should fail with no shortfall", async function () {
      // Mark Bob's account as liquidatable
      await this.rm.connect(alice).initiateLiquidation(bob.address);

      // Bob repays 500 F-NFT, clearing shortfall
      await this.ferc.connect(bob).repayBorrow(mantissa("500"));

      await expect(
        this.ferc.connect(alice).liquidateBorrow(bob.address, repayAmount, this.feth.address),
      ).to.be.revertedWith("RiskManager: Insufficient shortfall");
    });

    it("should fail with repay amount exceeding close factor limit", async function () {
      // Mark Bob's account as liquidatable, mining the 2nd block
      await this.rm.connect(alice).initiateLiquidation(bob.address);

      const repayAmountFail: BigNumber = mantissa("1113"); // 1113 F-NFT > 2225/2
      await expect(
        this.ferc.connect(alice).liquidateBorrow(bob.address, repayAmountFail, this.feth.address),
      ).to.be.revertedWith("RiskManager: Repay too much");
    });

    it("should fail with tokens to be seized exceeding borrower's balance", async function () {
      // Mark Bob's account as liquidatable, mining the 2nd block
      await this.rm.connect(alice).initiateLiquidation(bob.address);

      // Repay amount that will cause tx to fail
      const repayAmountFail: BigNumber = mantissa("500"); // 500 F-NFT
      // Attempt to seize 500 * 1.05 * 0.01 = 5.25 ETH
      await expect(
        this.ferc.connect(alice).liquidateBorrow(bob.address, repayAmountFail, this.feth.address),
      ).to.be.revertedWith("RiskManager: Seize token amount exceeds collateral");
    });

    context("with liquidation protection", async function () {
      beforeEach(async function () {
        await this.checker.connect(admin).addToken(this.feth.address);
        // Mark Bob's account as liquidatable
        await this.rm.connect(alice).initiateLiquidation(bob.address);
        // Alice liquidates Bob's borrow with 5% discount
        await this.ferc.connect(alice).liquidateBorrow(bob.address, repayAmount, this.feth.address);

        const blockNumber: number = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        liquidateTimestamp = block.timestamp;
        liquidateId = ethers.utils.solidityKeccak256(
          ["uint256", "address", "uint256"],
          [liquidateTimestamp, bob.address, 0],
        );

        // Get exchange rate where block number is same as when liquidateBorrow() is called
        const exchangeRateMantissa: BigNumber = await this.feth.exchangeRateCurrent();
        const valuePerCollateralTokenMantissa: BigNumber = ethPriceMantissa.mul(exchangeRateMantissa).div(_mantissa);
        // repayAmountAfterDiscount * ethPrice
        const seizeValue: BigNumber = repayAmount.mul(105).div(100).mul(priceMantissa).div(_mantissa);
        // Amount of fETH to seize
        seizeTokens = seizeValue.mul(_mantissa).div(valuePerCollateralTokenMantissa);
      });

      it("should succeed with correct data", async function () {
        // Check liquidation protection
        const lp = await this.feth.liquidationProtection(liquidateId);

        expect(lp[0]).to.equal(bob.address);
        expect(lp[1]).to.equal(alice.address);
        expect(lp[2]).to.equal(liquidateTimestamp);
        // repayValue = repayAmount * F-NFT price
        expect(lp[3]).to.equal(repayAmount.mul(priceMantissa).div(_mantissa));
        expect(lp[4]).to.equal(seizeTokens);
      });

      it("should succeed with liquidator claiming after time limit", async function () {
        // Fast forward to 24 hours and 1 sec after liquidation protection is triggered
        await ethers.provider.send("evm_mine", [liquidateTimestamp + 24 * 3600 + 1]);

        await this.feth.connect(alice).claimLiquidation(liquidateId);

        // Check contract and liquidator fETH balance
        expect(await this.feth.balanceOf(this.feth.address)).to.equal(0);
        expect(await this.feth.balanceOf(alice.address)).to.equal(seizeTokens);
      });

      it("should fail with liquidator claiming before time limit", async function () {
        // Fast forward to 5 hours after liquidation protection is triggered
        await ethers.provider.send("evm_mine", [liquidateTimestamp + 5 * 3600]);

        await expect(this.feth.connect(alice).claimLiquidation(liquidateId)).to.be.revertedWith(
          "TokenBase: Time limit not passed",
        );
      });

      it("should fail with non-liquidator claiming", async function () {
        // Fast forward to 24 hours and 1 sec after liquidation protection is triggered
        await ethers.provider.send("evm_mine", [liquidateTimestamp + 24 * 3600 + 1]);

        await expect(this.feth.connect(bob).claimLiquidation(liquidateId)).to.be.revertedWith(
          "TokenBase: Not liquidator of this liquidation",
        );
      });

      it("should succeed with borrower repaying at 1.2x price using F-NFT within time limit", async function () {
        // Fast forward to 1 min after liquidation protection is triggered
        await ethers.provider.send("evm_mine", [liquidateTimestamp + 60]);

        // F-NFT to repay
        const claimRepayAmount: BigNumber = repayAmount.mul(120).div(100);
        await this.feth.connect(bob).repayLiquidationWithErc(liquidateId, this.ferc.address);

        expect(await this.sp.balanceOf(bob.address)).to.equal(spBalanceBob.sub(claimRepayAmount));
        // Check contract and borrower fETH balance
        expect(await this.feth.balanceOf(this.feth.address)).to.equal(0);
        expect(await this.feth.balanceOf(bob.address)).to.equal(fethBalancePreLiquidationBob);
      });

      it("should succeed with borrower repaying at 1.2x price using ETH within time limit", async function () {
        // Fast forward to 1 min after liquidation protection is triggered
        await ethers.provider.send("evm_mine", [liquidateTimestamp + 60]);

        const repayValue: BigNumber = repayAmount.mul(priceMantissa).div(mantissa("1"));
        // ETH to repay
        const claimRepayAmount: BigNumber = repayValue.mul(120).div(100).div(1700);
        await expect(
          await this.feth.connect(bob).repayLiquidationWithEth(liquidateId, { value: claimRepayAmount }),
        ).to.changeEtherBalance(bob, claimRepayAmount.mul(-1));

        // Check contract and borrower fETH balance
        expect(await this.feth.balanceOf(this.feth.address)).to.equal(0);
        expect(await this.feth.balanceOf(bob.address)).to.equal(fethBalancePreLiquidationBob);
      });

      it("should fail with borrower repaying after time limit", async function () {
        // Fast forward to 24 hours and 1 sec after liquidation protection is triggered
        await ethers.provider.send("evm_mine", [liquidateTimestamp + 24 * 3600 + 1]);

        const repayValue: BigNumber = repayAmount.mul(priceMantissa).div(mantissa("1"));
        // ETH to repay
        const claimRepayAmount: BigNumber = repayValue.mul(120).div(100);
        await expect(
          this.feth.connect(bob).repayLiquidationWithEth(liquidateId, { value: claimRepayAmount }),
        ).to.be.revertedWith("TokenBase: Time limit passed");
      });

      it("should fail with borrower repaying at less than 1.2x price", async function () {
        // Fast forward to 1 min after liquidation protection is triggered
        await ethers.provider.send("evm_mine", [liquidateTimestamp + 60]);

        const repayValue: BigNumber = repayAmount.mul(priceMantissa).div(mantissa("1"));
        // ETH to repay, only 1.1x
        const claimRepayAmount: BigNumber = repayValue.mul(110).div(100).div(1700);
        await expect(
          this.feth.connect(bob).repayLiquidationWithEth(liquidateId, { value: claimRepayAmount }),
        ).to.be.revertedWith("TokenBase: Not enough ETH given");
      });
    });
  });
}
