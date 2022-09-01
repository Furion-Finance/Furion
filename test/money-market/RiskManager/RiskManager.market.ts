import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export function marketTest(): void {
  describe("Market Functions", function () {
    let admin: SignerWithAddress;
    let bob: SignerWithAddress;

    before(async function () {
      const signers: SignerWithAddress[] = await ethers.getSigners();
      admin = signers[0];
      bob = signers[1];
    });

    context("Enter markets", function () {
      it("should succeed", async function () {
        // List fETH market
        await this.rm.connect(admin).supportMarket(this.feth.address, mantissa("0.85"), 1);

        // Bob enters fETH market
        await expect(this.rm.connect(bob).enterMarkets([this.feth.address]))
          .to.emit(this.rm, "MarketEntered")
          .withArgs(this.feth.address, bob.address);
        expect(await this.rm.checkMembership(bob.address, this.feth.address)).to.equal(true);
      });

      it("should fail with unlisted market", async function () {
        await expect(this.rm.connect(bob).enterMarkets([this.feth.address])).to.be.revertedWith(
          "RiskManager: Market is not listed",
        );
      });
    });

    context("Exit markets", function () {
      it("should succeed with no borrow balance", async function () {
        // List fETH market
        await this.rm.connect(admin).supportMarket(this.feth.address, mantissa("0.85"), 1);
        // Enter fETH market
        await this.rm.connect(bob).enterMarkets([this.feth.address]);

        // Bob exits fETH market
        await expect(this.rm.connect(bob).exitMarket(this.feth.address))
          .to.emit(this.rm, "MarketExited")
          .withArgs(this.feth.address, bob.address);
      });
    });
  });
}
