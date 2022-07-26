import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { solidity } from "ethereum-waffle";
import chai from "chai";
chai.use(solidity);
const { expect } = chai;

const { ethers } = require("hardhat");

import {
    WETH9,
    WETH9__factory,
    MockERC20,
    MockERC20__factory,
    MockUSD,
    MockUSD__factory,
    FurionSwapFactory,
    FurionSwapFactory__factory,
} from "../../typechain";

describe("Furion Swap Factory", function(){
    let erc: MockERC20, weth: WETH9, usd: MockUSD;

    let dev: SignerWithAddress, user1: SignerWithAddress, users: SignerWithAddress[];

    let factory: FurionSwapFactory;

    beforeEach(async function(){
        [dev, user1, ...users] = await ethers.getSigners();

        factory = await new FurionSwapFactory__factory(dev).deploy(dev.address);
        erc = await new MockERC20__factory(dev).deploy();
        usd = await new MockUSD__factory(dev).deploy();
        weth = await new WETH9__factory(dev).deploy();

        await factory.deployed();
        await erc.deployed();
        await usd.deployed();
    });

    it("should have the correct incomeMaker and feeRate", async function(){
        expect(await factory.incomeMakerProportion()).to.equal("1");
        expect(await factory.incomeMaker()).to.equal(dev.address);
    });

    it("should work well with setIncomeMaker", async function(){
        await factory.setIncomeMakerAddress(user1.address);
        expect(await factory.incomeMaker()).to.equal(user1.address);
    });

    it("should work well with createPair", async function(){
        await expect(factory.createPair(erc.address, erc.address)).to.revertedWith("FurionSwap: IDENTICAL_ADDRESSES");

        await factory.createPair(erc.address, usd.address);
        expect(await factory.getPair(erc.address, usd.address)).to.equal(await factory.getPair(usd.address, erc.address));

        await expect(factory.createPair(usd.address, erc.address)).to.revertedWith("FurionSwap: PAIR_EXISTS");
    })

})