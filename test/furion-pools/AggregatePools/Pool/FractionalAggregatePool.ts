import { BigNumberish } from "@ethersproject/bignumber";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";

import { Signers } from "../../../types";
import { deployFAPFixture } from "./FractionalAggregatePool.fixture";

// Initial NFT balances: (id)
// admin: three NFT (0, 1, 2), one NFT1 (0)
// bob: two NFT (3, 4), one NFT1 (1)
// alice: one NFT (5), one NFT1 (2)

describe("Fractional Aggregate Pool", function () {
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
    const { nft, fur, sp, sp1, fap, fpo } = await this.loadFixture(deployFAPFixture);
    this.nft = nft;
    this.fur = fur;
    this.sp = sp;
    this.sp1 = sp1;
    this.fap = fap;
    this.fpo = fpo;
  });

  const nftPrice = su("2");
  const nftPriceChanged = su("2.5");
  const fftInitialPrice = su("0.01");

  context("Staking", async function () {
    it("should stake F-* tokens to get FFT with 0.01 ETH being the ref price of FFT for the first stake", async function () {
      // Bob stakes all F-NFT
      await this.fap.connect(this.signers.bob).stake(this.sp.address, su("2000"));

      // F-NFT in aggregate pool
      expect(await this.sp.balanceOf(this.fap.address)).to.equal(su("2000"));
      // Bob gets ((15 / 1000) * 2000) / 0.01 = 3000 FFT-SING, based on the assumption that
      // the NFT now is worth 15 ETH and FFT-SING has a ref price of 0.01 ETH for the first stake
      expect(await this.fap.balanceOf(this.signers.bob.address)).to.equal(su("400"));
      // 1000 - 100 = 900 FUR
      expect(await this.fur.balanceOf(this.signers.bob.address)).to.equal(su("900"));
    });

    it("should stake F-* tokens to get FFT with ref price of FFT correctly calculated", async function () {
      // Bob stakes 1000 F-NFT first
      await this.fap.connect(this.signers.bob).stake(this.sp.address, su("1000"));

      // Bob gets ((4 / 1000) * 1000) / 0.01 = 400 FFT-SING, based on the assumption that
      // the NFT now is worth 2 ETH and FFT-SING has a ref price of 0.01 ETH for the first stake
      expect(await this.fap.balanceOf(this.signers.bob.address)).to.equal(su("200"));

      // Bob stakes remaining 1000 F-NFT, when price of NFT increases to 2.5 ETH
      await this.fpo.connect(this.signers.admin).updatePrice(this.nft.address, 0, nftPriceChanged);
      await this.fap.connect(this.signers.bob).stake(this.sp.address, su("1000"));

      // FFT ref price = sum / circulating supply = 2.5 / 200 = 0.0125 ETH
      // Bob gets 2.5 / 0.0125 = 200 FFT-SING
      expect(await this.fap.balanceOf(this.signers.bob.address)).to.equal(su("400"));
      // 1000 - 200 = 800 FUR
      expect(await this.fur.balanceOf(this.signers.bob.address)).to.equal(su("800"));
      expect(await this.sp.balanceOf(this.fap.address)).to.equal(su("2000"));
    });

    it("should not allow staking of unregistered tokens", async function () {
      // Bob tries to stake F-NFT1 which is not registered to the aggregate pool
      await expect(this.fap.connect(this.signers.bob).stake(this.sp1.address, su("1000"))).to.be.revertedWith(
        "AggregatePool: Token not accepted in this pool.",
      );
    });
  });

  context("Unstaking", async function () {
    it("should unstake with correct calculations given no NFT price changes", async function () {
      // Bob stakes all F-NFT, gets 400 FFT-SING
      await this.fap.connect(this.signers.bob).stake(this.sp.address, su("2000"));

      // Bob unstakes with 400 FFT-SING
      await this.fap.connect(this.signers.bob).unstake(this.sp.address, su("400"));
      // Bob gets 400 * (4 / 400) / 0.002 = 2000 F-NFT
      expect(await this.sp.balanceOf(this.signers.bob.address)).to.equal(su("2000"));
      // 1000 - 200 = 800 FUR
      expect(await this.fur.balanceOf(this.signers.bob.address)).to.equal(su("800"));
    });

    it("should unstake with correct calculations given NFT price changes", async function () {
      // Bob stakes all F-NFT, gets 400 FFT-SING
      await this.fap.connect(this.signers.bob).stake(this.sp.address, su("2000"));

      // Price of NFT increases to 2.5 ETH
      // Bob gets 400 * (5 / 400) / 0.0025 = 2000 F-NFT
      await this.fpo.updatePrice(this.nft.address, 0, nftPriceChanged);

      // Bob unstakes with 400 FFT-SING
      await this.fap.connect(this.signers.bob).unstake(this.sp.address, su("400"));

      expect(await this.sp.balanceOf(this.signers.bob.address)).to.equal(su("2000"));
      // 1000 - 200 = 800 FUR
      expect(await this.fur.balanceOf(this.signers.bob.address)).to.equal(su("800"));
    });

    it("should not allow unstaking of unregistered tokens", async function () {
      // Bob stakes all F-NFT, gets 400 FFT-SING
      await this.fap.connect(this.signers.bob).stake(this.sp.address, su("2000"));

      // Bob tries to unstake with 400 FFT-SING to get F-NFT1 which is unregistered
      await expect(this.fap.connect(this.signers.bob).unstake(this.sp1.address, su("400"))).to.be.revertedWith(
        "AggregatePool: Token not accepted in this pool.",
      );
    });
  });
});
