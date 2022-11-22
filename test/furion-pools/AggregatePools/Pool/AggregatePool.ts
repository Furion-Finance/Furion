import { BigNumber } from "@ethersproject/bignumber";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";

import { Signers } from "../../../types";
import { deployAPFixture } from "./AggregatePool.fixture";

// Convert to smallest unit (10^18)
function su(amount: string): BigNumber {
  return ethers.utils.parseEther(amount);
}

describe("Aggregate Pool", function () {
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
    const { nft, nft1, ap, fpo } = await this.loadFixture(deployAPFixture);
    this.nft = nft;
    this.nft1 = nft1;
    this.ap = ap;
    this.fpo = fpo;
  });

  const nftPrice = su("2");
  const nftPriceChanged = su("2.5");
  const nft1Price = su("1.5");
  const fftInitialPrice = su("0.01");
  const mantissa = 1e18;

  context("Storing", async function () {
    it("should succeed with one NFT stored", async function () {
      // Store one NFT
      await this.ap.connect(this.signers.bob).store(this.nft.address, 3);

      expect(await this.nft.ownerOf(3)).to.equal(this.ap.address);
      const fftBalance = nftPrice / fftInitialPrice;
      expect(await this.ap.balanceOf(this.signers.bob.address)).to.equal(su(String(fftBalance)));
    });

    it("should succeed with multiple NFTs of the same collection stored", async function () {
      // Store multiple NFTs in one tx
      await this.ap.connect(this.signers.bob).storeBatch(this.nft.address, [3, 4]);

      expect(await this.nft.ownerOf(3)).to.equal(this.ap.address);
      expect(await this.nft.ownerOf(4)).to.equal(this.ap.address);
      const fftBalance = (nftPrice * 2) / fftInitialPrice;
      expect(await this.ap.balanceOf(this.signers.bob.address)).to.equal(su(String(fftBalance)));
    });

    it("should succeed with NFTs of different collections stored", async function () {
      // Store one NFT
      await this.ap.connect(this.signers.bob).store(this.nft.address, 3);
      let fftBalance = nftPrice / fftInitialPrice;
      let fftPrice = nftPrice / fftBalance;

      // Store one NFT1
      await this.ap.connect(this.signers.bob).store(this.nft1.address, 1);
      fftBalance += nft1Price / fftPrice;
      fftPrice = (nftPrice + nft1Price) / fftBalance;

      expect(await this.nft.ownerOf(3)).to.equal(this.ap.address);
      expect(await this.nft1.ownerOf(1)).to.equal(this.ap.address);
      expect(await this.ap.balanceOf(this.signers.bob.address)).to.equal(su(String(fftBalance)));
    });
  });

  context("Buying", async function () {
    it("should succeed with one NFT bought", async function () {
      // Store one NFT
      await this.ap.connect(this.signers.bob).store(this.nft.address, 3);
      // Buy one NFT
      await this.ap.connect(this.signers.bob).buy(this.nft.address, 3);

      expect(await this.nft.ownerOf(3)).to.equal(this.signers.bob.address);
      expect(await this.ap.balanceOf(this.signers.bob.address)).to.equal(0);
    });

    it("should succeed with multiple NFTs bought", async function () {
      // Store multiple NFTs
      await this.ap.connect(this.signers.bob).storeBatch(this.nft.address, [3, 4]);

      // Buy multiple NFTs
      await this.ap.connect(this.signers.bob).buyBatch(this.nft.address, [3, 4]);

      expect(await this.nft.ownerOf(3)).to.equal(this.signers.bob.address);
      expect(await this.nft.ownerOf(4)).to.equal(this.signers.bob.address);
      expect(await this.ap.balanceOf(this.signers.bob.address)).to.equal(0);
    });

    it("should succeed with correct FFT burn amount when there is change in NFT price", async function () {
      // Store multiple NFTs
      await this.ap.connect(this.signers.bob).storeBatch(this.nft.address, [3, 4]);
      const fftBalanceBeforeBuy = (nftPrice * 2) / fftInitialPrice;
      let fftPrice = (nftPrice * 2) / fftBalanceBeforeBuy;

      // Price of NFT increases to 2.5 ETH
      await this.fpo.connect(this.signers.admin).updatePrice(this.nft.address, 0, nftPriceChanged);

      // Buy one NFT
      fftPrice = (nftPriceChanged * 2) / fftBalanceBeforeBuy;
      const burnAmount = nftPriceChanged / fftPrice;
      await this.ap.connect(this.signers.bob).buy(this.nft.address, 3);

      expect(await this.nft.ownerOf(3)).to.equal(this.signers.bob.address);
      const fftBalanceAfterBuy = fftBalanceBeforeBuy - burnAmount;
      expect(await this.ap.balanceOf(this.signers.bob.address)).to.equal(su(String(fftBalanceAfterBuy)));
    });
  });
});
