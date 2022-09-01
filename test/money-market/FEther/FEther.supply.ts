import { BigNumber } from "@ethersproject/bignumber";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";

function mantissa(amount: string): BigNumber {
  return ethers.utils.parseUnits(amount, 18);
}

export function supplyTest(): void {
  describe("Supply ETH to mint fETH", async function () {
    let admin: SignerWithAddress;
    let bob: SignerWithAddress;

    before(async function () {
      const signers: SignerWithAddress[] = await ethers.getSigners();
      admin = signers[0];
      bob = signers[1];
    });

    const ethSupplied: BigNumber = mantissa("5");
    // Initial exchange rate is 1 fToken = 50 underlying
    const calMintAmount: BigNumber = mantissa("5").div(50);

    it("should succeed", async function () {
      // Bob supplies 5 ETH to get fETH
      // Check for event first to avoid result mismatch due to interest accrual
      await expect(this.feth.connect(bob).supply({ value: ethSupplied }))
        .to.emit(this.feth, "Supply")
        .withArgs(bob.address, ethSupplied, calMintAmount);

      expect(await this.feth.totalSupply()).to.equal(calMintAmount);
      expect(await this.feth.totalCash()).to.equal(ethSupplied);

      // Check for ETH reduced from wallet after supplying
      await expect(await this.feth.connect(bob).supply({ value: ethSupplied })).to.changeEtherBalance(
        bob,
        ethSupplied.mul(-1),
      );
    });

    it("should fail when supply is paused", async function () {
      // Admin pauses supply function of fETH market
      await this.rm.connect(admin).setSupplyPaused(this.feth.address, true);

      await expect(this.feth.connect(bob).supply({ value: ethSupplied })).to.be.revertedWith(
        "RiskManager: Supplying is paused",
      );
    });
  });
}
