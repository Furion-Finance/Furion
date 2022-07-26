import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { solidity } from "ethereum-waffle";
import chai from "chai";
chai.use(solidity);
const { expect } = chai;

const { ethers } = require("hardhat");

import {
    FurionToken,
    FurionToken__factory,
    MockERC20,
    MockERC20__factory,
    WETH9,
    WETH9__factory,
    FurionSwapFactory,
    FurionSwapFactory__factory,
    FurionSwapV2Router,
    FurionSwapV2Router__factory,
    FurionSwapPair,
    FurionSwapPair__factory,
    IncomeSharingVault,
    IncomeSharingVault__factory,
    IncomeMaker,
    IncomeMaker__factory,
    VoteEscrowedFurion,
    VoteEscrowedFurion__factory
} from "../../typechain";

import {
    customErrorMsg,
    getLatestBlockTimestamp,
    stablecoinToWei,
    toWei,
    zeroAddress,
} from "../utils";
import { formatEther, parseUnits } from "ethers/lib/utils";

describe("Furion Income Maker", function(){
    let erc: MockERC20, furion: FurionToken;
    let weth: WETH9;

    let factory: FurionSwapFactory, router: FurionSwapV2Router;
    let pair: FurionSwapPair, pairAddress: string;

    let dev: SignerWithAddress, user1: SignerWithAddress, users: SignerWithAddress[];

    let maker: IncomeMaker, vault: IncomeSharingVault;
    let veFUR: VoteEscrowedFurion;


    beforeEach(async function(){
        [dev, user1, ...users] = await ethers.getSigners();

        furion = await new FurionToken__factory(dev).deploy();
        erc = await new MockERC20__factory(dev).deploy();
        weth = await new WETH9__factory(dev).deploy();

        furion.deployed();
        erc.deployed();
        weth.deployed();
        
        let veFURToken = await ethers.getContractFactory("VoteEscrowedFurion");
        veFUR = await veFURToken.deploy();
        await veFUR.deployed();
        // Initialize veFUR
        await veFUR.initialize(furion.address);

        vault = await new IncomeSharingVault__factory(dev).deploy();
        vault.initialize(veFUR.address);

        maker = await new IncomeMaker__factory(dev).deploy();
        await maker.deployed();

        factory = await new FurionSwapFactory__factory(dev).deploy(maker.address);
        await factory.deployed();

        router = await new FurionSwapV2Router__factory(dev).deploy(factory.address, weth.address);
        await router.deployed();

        await factory.createPair(furion.address, erc.address);
        pairAddress = await factory.getPair(furion.address, erc.address);
        const furionSwapPair = await ethers.getContractFactory("FurionSwapPair");
        pair = await furionSwapPair.attach(pairAddress);

        maker.initialize(
            furion.address, router.address,
            factory.address, vault.address
        );
    })

    describe("Get tx fee from furion swap", async function(){
        beforeEach(async function(){
            // let dev provide liquidity, and user1 to swap

            let amount = toWei("1000");

            // mint tokens to accounts
            await erc.mint(dev.address, amount);
            await furion.mintFurion(dev.address, amount);
            await erc.mint(user1.address, amount);
            await furion.mintFurion(user1.address, amount);

            await erc.approve(router.address, amount);
            await furion.approve(router.address, amount);
            await erc.connect(user1).approve(router.address, amount);
            await furion.connect(user1).approve(router.address, amount);
        })
        
        it("should have correct maker for factory", async function (){
            expect(await factory.incomeMaker()).to.equal(maker.address);
        })

        it("should be able to earn tx fee from furion swap", async function(){
            let amount = toWei("1000");
            const now = await getLatestBlockTimestamp(ethers.provider);
            await router.addLiquidity(
                furion.address,
                erc.address,
                amount,
                amount,
                toWei("10"),
                toWei("10"),
                dev.address,
                now + 100
            );

            await router.connect(user1).swapExactTokensForTokens(
                toWei("100"),
                toWei("1"),
                [erc.address, furion.address],
                user1.address,
                now + 500
            );

            let userBalance = await pair.balanceOf(dev.address);
            // console.log('dev balance', userBalance);
            await pair.approve(router.address, toWei("100000"));

            await router.removeLiquidity(
                furion.address,
                erc.address,
                toWei("20"),
                toWei('1'),
                toWei('1'),
                dev.address,
                now + 1000
            );

            let makerBalance = await pair.balanceOf(maker.address);
            
            // console.log("maker balance", makerBalance);
            expect(makerBalance).to.above(toWei("0"));

            await maker.collectIncomeFromSwap(furion.address, erc.address);

            let vaultBalance = await furion.balanceOf(vault.address);
            // console.log(vaultBalance);

            expect(vaultBalance).to.above(toWei("0.0015"));
            expect(vaultBalance).to.below(toWei("0.0025"));
        });
    })

})
