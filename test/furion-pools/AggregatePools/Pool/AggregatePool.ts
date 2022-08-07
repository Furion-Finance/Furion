import { BigNumberish } from "@ethersproject/bignumber";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";

import { Signers } from "../../../types";
import { deployAPFixture } from "./AggregatePool.fixture";

// Initial NFT balances: (id)
// admin: three NFT (0, 1, 2), one NFT1 (0)
// bob: two NFT (3, 4), one NFT1 (1)
// alice: one NFT (5), one NFT1 (2)

describe("Aggregate Pool", function () {
  // Convert to smallest unit (10^18)
  function su(amount: string): BigNumberish {
    return ethers.utils.parseEther(amount);
  }

  // Signers declaration
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.bob = signers[1];
    this.signers.alice = signers[2];

    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    const { nft, nft1, furT, checker, spf, apf, sp, sp1, ap } = await this.loadFixture(deployAPFixture);
    this.nft = nft;
    this.nft1 = nft1;
    this.furT = furT;
    this.checker = checker;
    this.spf = spf;
    this.apf = apf;
    this.sp = sp;
    this.sp1 = sp1;
    this.ap = ap;
  });

  context("Staking", async function () {
    it("should stake F-* tokens to get FFT with 0.01 ETH being the ref price of FFT for the first stake", async function () {
      // Bob stakes all F-NFT
      await this.sp.connect(this.signers.bob).approve(this.ap.address, su("2000"));
      await this.furT.connect(this.signers.bob).approve(this.ap.address, su("100"));
      await this.ap.connect(this.signers.bob).stake(this.sp.address, su("2000"), 0);

      // F-NFT in aggregate pool
      expect(await this.sp.balanceOf(this.ap.address)).to.equal(su("2000"));
      // Bob gets ((15 / 1000) * 2000) / 0.01 = 3000 FFT1, based on the assumption that
      // the NFT now is worth 15 ETH and FFT has a ref price of 0.01 ETH for the first stake
      expect(await this.ap.balanceOf(this.signers.bob.address)).to.equal(su("3000"));
      // Admin is fee receiver, 100 = 100 FUR
      expect(await this.furT.balanceOf(this.signers.admin.address)).to.equal(su("1100"));
      expect(await this.furT.balanceOf(this.signers.bob.address)).to.equal(su("900"));
    });

    it("should stake F-* tokens to get FFT with ref price of FFT correctly calculated", async function () {
      // Bob stakes 1000 F-NFT first
      await this.sp.connect(this.signers.bob).approve(this.ap.address, su("2000"));
      await this.furT.connect(this.signers.bob).approve(this.ap.address, su("200"));
      await this.ap.connect(this.signers.bob).stake(this.sp.address, su("1000"), 0);

      // Bob gets ((15 / 1000) * 1000) / 0.01 = 1500 FFT1, based on the assumption that
      // the NFT now is worth 15 ETH and FFT has a ref price of 0.01 ETH for the first stake
      expect(await this.ap.balanceOf(this.signers.bob.address)).to.equal(su("1500"));

      // Bob stakes remaining 1000 F-NFT, when price of NFT increases to 18 ETH
      await this.ap.connect(this.signers.bob).stake(this.sp.address, su("1000"), 1);

      // FFT ref price = sum / circulating supply = ((18 / 1000) * 1000) / 1500 = 0.012 ETH
      // Bob gets ((18 / 1000) * 1000) / 0.012 = 1500 FFT1
      expect(await this.ap.balanceOf(this.signers.bob.address)).to.equal(su("3000"));
      // Admin is fee receiver, 100 + 100 = 200 FUR
      expect(await this.furT.balanceOf(this.signers.admin.address)).to.equal(su("1200"));
      expect(await this.furT.balanceOf(this.signers.bob.address)).to.equal(su("800"));
      expect(await this.sp.balanceOf(this.ap.address)).to.equal(su("2000"));
    });

    it("should not allow staking of unregistered tokens", async function () {
      // Bob tries to stake F-NFT1 which is not registered to the aggregate pool
      await this.sp1.connect(this.signers.bob).approve(this.ap.address, su("1000"));
      await this.furT.connect(this.signers.bob).approve(this.ap.address, su("100"));
      await expect(this.ap.connect(this.signers.bob).stake(this.sp1.address, su("1000"), 0)).to.be.revertedWith(
        "AggregatePool: Token not accepted in this pool.",
      );
    });
  });

  context("Unstaking", async function () {
    it("should unstake with correct calculations given no NFT price changes", async function () {
      // Bob stakes all F-NFT, gets 3000 FFT1
      await this.sp.connect(this.signers.bob).approve(this.ap.address, su("2000"));
      await this.furT.connect(this.signers.bob).approve(this.ap.address, su("100"));
      await this.ap.connect(this.signers.bob).stake(this.sp.address, su("2000"), 0);

      // Bob unstakes with 3000 FFT1
      await this.furT.connect(this.signers.bob).approve(this.ap.address, su("100"));
      await this.ap.connect(this.signers.bob).unstake(this.sp.address, su("3000"), 0);
      // Bob gets 3000 * (30 / 3000) / 0.015 = 2000 F-NFT
      expect(await this.sp.balanceOf(this.signers.bob.address)).to.equal(su("2000"));
      // Admin (fee receiver) gets 100 + 100 = 200 FUR
      expect(await this.furT.balanceOf(this.signers.admin.address)).to.equal(su("1200"));
      expect(await this.furT.balanceOf(this.signers.bob.address)).to.equal(su("800"));
    });

    it("should unstake with correct calculations given NFT price changes", async function () {
      // Bob stakes all F-NFT, gets 3000 FFT1
      await this.sp.connect(this.signers.bob).approve(this.ap.address, su("2000"));
      await this.furT.connect(this.signers.bob).approve(this.ap.address, su("100"));
      await this.ap.connect(this.signers.bob).stake(this.sp.address, su("2000"), 0);

      // Bob unstakes with 3000 FFT1
      await this.furT.connect(this.signers.bob).approve(this.ap.address, su("100"));
      await this.ap.connect(this.signers.bob).unstake(this.sp.address, su("3000"), 1);
      // Price of NFT increases to 18 ETH
      // Bob gets 3000 * (36 / 3000) / 0.018 = 2000 F-NFT
      expect(await this.sp.balanceOf(this.signers.bob.address)).to.equal(su("2000"));
      // Admin (fee receiver) gets 100 + 100 = 200 FUR
      expect(await this.furT.balanceOf(this.signers.admin.address)).to.equal(su("1200"));
      expect(await this.furT.balanceOf(this.signers.bob.address)).to.equal(su("800"));
    });

    it("should not allow unstaking of unregistered tokens", async function () {
      // Bob stakes all F-NFT, gets 3000 FFT1
      await this.sp.connect(this.signers.bob).approve(this.ap.address, su("2000"));
      await this.furT.connect(this.signers.bob).approve(this.ap.address, su("100"));
      await this.ap.connect(this.signers.bob).stake(this.sp.address, su("2000"), 0);

      // Bob tries to unstake with 3000 FFT1 to get F-NFT1 which is unregistered
      await expect(this.ap.connect(this.signers.bob).unstake(this.sp1.address, su("3000"), 0)).to.be.revertedWith(
        "AggregatePool: Token not accepted in this pool.",
      );
    });
  });
});
