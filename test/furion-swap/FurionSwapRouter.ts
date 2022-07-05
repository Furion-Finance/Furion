import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { solidity } from "ethereum-waffle";
import chai from "chai";
chai.use(solidity);
const { expect } = chai;

import { BigNumber } from "ethers";
const { ethers } = require("hardhat");

import {
    getAmountIn,
    getAmountOut
} from "./utils";

import {
    IERC20,
    WETH9,
    WETH9__factory,
    MockERC20,
    MockERC20__factory,
    MockUSD,
    MockUSD__factory,
    FurionSwapFactory,
    FurionSwapFactory__factory,
    FurionSwapV2Router,
    FurionSwapV2Router__factory,
    FurionSwapPair,
    FurionSwapPair__factory
} from "../../typechain";

import {
    formatStablecoin,
    formatTokenAmount,
    getLatestBlockTimestamp,
    stablecoinToWei,
    toBN,
    toWei,
} from "../utils";

describe("Furion Swap V2 Router", function(){
    let erc: MockERC20, weth: WETH9, usd: MockUSD;

    let dev: SignerWithAddress, user1: SignerWithAddress, users: SignerWithAddress[];

    let factory: FurionSwapFactory, router: FurionSwapV2Router;
    let pair1: FurionSwapPair, pair2: FurionSwapPair;
    let pairAddress1: string, pairAddress2: string;
    const txDelay = 60000;

    let now: number;

    beforeEach(async function () {
        [dev, user1, ...users] = await ethers.getSigners();

        factory = await new FurionSwapFactory__factory(dev).deploy(dev.address);
        erc = await new MockERC20__factory(dev).deploy();
        usd = await new MockUSD__factory(dev).deploy();
        weth = await new WETH9__factory(dev).deploy();

        await factory.deployed();
        await erc.deployed();
        await usd.deployed();

        router = await new FurionSwapV2Router__factory(dev).deploy(factory.address, weth.address);
        await router.deployed();

        await factory.createPair(erc.address, usd.address);
        await factory.createPair(erc.address, weth.address);

        pairAddress1 = await factory.getPair(erc.address, usd.address);
        pairAddress2 = await factory.getPair(erc.address, weth.address);

        const furionSwapPair = await ethers.getContractFactory("FurionSwapPair");
        pair1 = furionSwapPair.attach(pairAddress1);
        pair2 = furionSwapPair.attach(pairAddress2);
    });

    describe("Add and remove liquidity for tokens(not ETH)", function(){
        it("should be able to add liquidity to mint LP token", async function(){
            await erc.mint(dev.address, toWei("1000"));
            await usd.mint(dev.address, stablecoinToWei("1000"));

            await erc.approve(router.address, toWei("1000"));
            await usd.approve(router.address, stablecoinToWei("1000"));

            now = await getLatestBlockTimestamp(ethers.provider);

            await expect(
                router.addLiquidity(
                    erc.address,
                    usd.address,
                    toWei("100"),
                    stablecoinToWei("100"),
                    toWei("80"),
                    stablecoinToWei("80"),
                    dev.address,
                    now + txDelay
                )
            )
                .to.emit(router, "LiquidityAdded")
                .withArgs(
                    pairAddress1,
                    toWei("100"),
                    stablecoinToWei("100"),
                    stablecoinToWei("99999999.999")
                );
            
            expect(await erc.balanceOf(dev.address)).to.equal(toWei("900"));
            expect(await usd.balanceOf(dev.address)).to.equal(toBN(stablecoinToWei("100900"))); // since the dev account have 10000 as initial value

            expect(await pair1.balanceOf(dev.address)).to.equal(stablecoinToWei("99999999.999"));

            await expect(router.addLiquidity(
                erc.address,
                usd.address,
                toWei("100"),
                stablecoinToWei("80"),
                toWei("100"),
                stablecoinToWei("80"),
                dev.address,
                now + txDelay
            )).to.revertedWith("INSUFFICIENT_A_AMOUNT");
        });

        it("should be able to remove liquidity from the pool", async function(){

            await erc.mint(dev.address, toWei("1000"));
            await usd.mint(dev.address, stablecoinToWei("1000"));

            await erc.approve(router.address, toWei("1000"));
            await usd.approve(router.address, stablecoinToWei("1000"));

            now = await getLatestBlockTimestamp(ethers.provider);

            await router.addLiquidity(
                    erc.address,
                    usd.address,
                    toWei("100"),
                    stablecoinToWei("100"),
                    toWei("80"),
                    stablecoinToWei("80"),
                    dev.address,
                    now + txDelay
                )

            await pair1.approve(router.address, toWei("100000"));

            await expect(
                router.removeLiquidity(
                    erc.address,
                    usd.address,
                    stablecoinToWei("99999900.999"),
                    toWei("100"),
                    stablecoinToWei("100"),
                    dev.address,
                    now + txDelay
                )
            ).to.revertedWith("Insufficient amount for token0");

            let balance0: BigNumber, balance1: BigNumber;
            if (erc.address < usd.address){
                balance0 = toWei("99.999999999");
                balance1 = stablecoinToWei("99");
            }else{
                balance1 = toWei("99.999999999");
                balance0 = stablecoinToWei("99.999999");
            }

            await expect(
                router.removeLiquidity(
                    erc.address,
                    usd.address,
                    stablecoinToWei("99999999.999"),
                    toWei("1"),
                    stablecoinToWei("1"),
                    dev.address,
                    now + txDelay
                )
            ).to.emit(router, "LiquidityRemoved")
                .withArgs(
                    pairAddress1,
                    balance0,
                    balance1,
                    stablecoinToWei("99999999.999")
                );
        })
    });

    describe("Add and remove liquidity for ETH", function () {
        it("should be able to add liquidity to mint LP token", async function () {
            await erc.mint(dev.address, toWei("1000"));

            await erc.approve(router.address, toWei("1000"));

            now = await getLatestBlockTimestamp(ethers.provider);

            await expect(
                router.addLiquidityETH(
                    erc.address,
                    toWei("100"),
                    toWei("80"),
                    toWei("80"),
                    dev.address,
                    now + txDelay,
                    { value: toWei("100")}
                )
            )
                .to.emit(router, "LiquidityAdded")
                .withArgs(
                    pairAddress2,
                    toWei("100"),
                    toWei("100"),
                    toWei("99.999999999999999")
                );

            expect(await erc.balanceOf(dev.address)).to.equal(toWei("900"));

            expect(await pair2.balanceOf(dev.address)).to.equal(toWei("99.999999999999999"));
        });

        it("should be able to remove liquidity from the pool", async function () {

            await erc.mint(dev.address, toWei("1000"));

            await erc.approve(router.address, toWei("100000"));

            now = await getLatestBlockTimestamp(ethers.provider);

            await router.addLiquidityETH(
                    erc.address,
                    toWei("100"),
                    toWei("80"),
                    toWei("80"),
                    dev.address,
                    now + txDelay,
                    { value: toWei("100") }
                )
            
            await pair2.approve(router.address, toWei("100000"));
            await weth.approve(weth.address, toWei("100000"));

            await expect(
                router.removeLiquidityETH(
                    erc.address,
                    toWei("99.999999999999999"),
                    toWei("1"),
                    toWei("1"),
                    dev.address,
                    now + txDelay
                )
            ).to.emit(router, "LiquidityRemoved")
                .withArgs(
                    pairAddress2,
                    toWei("99.999999999999999"),
                    toWei("99.999999999999999"),
                    toWei("99.999999999999999")
                );
        })
    });

    describe("Swap tokens(ERC20 token, not for WETH)", function(){
        beforeEach(async function(){
            // mint tokens for two users, and approve tokens towards Router
            await erc.mint(dev.address, toWei("1000"));
            await usd.mint(dev.address, stablecoinToWei("1000"));
            await erc.mint(user1.address, toWei("1000"));
            await usd.mint(user1.address, stablecoinToWei("1000"));

            await erc.approve(router.address, toWei("1000"));
            await usd.approve(router.address, stablecoinToWei("1000"));
            await erc.connect(user1).approve(router.address, toWei("1000"));
            await usd.connect(user1).approve(router.address, stablecoinToWei("1000"));

            await router.addLiquidity(
                erc.address,
                usd.address,
                toWei("1000"),
                stablecoinToWei("1000"),
                toWei("800"),
                stablecoinToWei("800"),
                dev.address,
                now + txDelay
            );
        });

        it("should be able to swap tokens for exact tokens", async function(){
            await expect(router.connect(user1).swapTokensForExactTokens(
                stablecoinToWei("1"),
                toWei("1"),
                [erc.address, usd.address],
                user1.address,
                now + txDelay
            )).to.revertedWith("FurionSwapV2Router: EXCESSIVE_INPUT_AMOUNT");
            
            await router.connect(user1).swapTokensForExactTokens(
                stablecoinToWei("1"),
                toWei("10"),
                [erc.address, usd.address],
                user1.address,
                now + txDelay
            );
            
            expect(await usd.balanceOf(user1.address)).to.equal(stablecoinToWei("1001"));
            
            const amountIn = getAmountIn(stablecoinToWei("1"), toWei("1000"), stablecoinToWei("1000"), 3);

            expect(await erc.balanceOf(user1.address)).to.equal(toWei("1000").sub(amountIn));
            
        });

        it("should be able to swap exact tokens for tokens", async function () {
            await expect(router.connect(user1).swapExactTokensForTokens(
                toWei("100"),
                stablecoinToWei("100"),
                [erc.address, usd.address],
                user1.address,
                now + txDelay
            )).to.revertedWith("FurionSwapV2Router: INSUFFICIENT_OUTPUT_AMOUNT");

            await router.connect(user1).swapExactTokensForTokens(
                toWei("100"),
                stablecoinToWei("1"),
                [erc.address, usd.address],
                user1.address,
                now + txDelay
            );

            expect(await erc.balanceOf(user1.address)).to.equal(toWei("900"));

            const amountOut = getAmountOut(toWei("100"), toWei("1000"), stablecoinToWei("1000"), 3);

            expect(await usd.balanceOf(user1.address)).to.equal(stablecoinToWei("1000").add(amountOut));

        });
    });

    describe("Swap tokens with ETH or for ETH", function () {
        beforeEach(async function () {
            // mint tokens for two users, and approve tokens towards Router
            await erc.mint(dev.address, toWei("1000"));
            await erc.mint(user1.address, toWei("1000"));


            await erc.approve(router.address, toWei("1000"));
            await erc.connect(user1).approve(router.address, toWei("1000"));

            await router.addLiquidityETH(
                    erc.address,
                    toWei("1000"),
                    toWei("80"),
                    toWei("80"),
                    dev.address,
                    now + txDelay,
                    { value: toWei("1000") }
                )
        });

        it("should be able to swap tokens for exact ETH", async function () {
            let initialValue: BigNumber, finalValue: BigNumber;

            initialValue = await ethers.provider.getBalance(user1.address);

            await expect(router.connect(user1).swapTokensForExactETH(
                toWei("10"),
                toWei("1"),
                [erc.address, usd.address],
                user1.address,
                now + txDelay
            )).to.revertedWith("FurionSwapV2Router: INVALID_PATH");

            await expect(router.connect(user1).swapTokensForExactETH(
                toWei("10"),
                toWei("1"),
                [erc.address, weth.address],
                user1.address,
                now + txDelay
            )).to.revertedWith("FurionSwapV2Router: EXCESSIVE_INPUT_AMOUNT");

            await router.connect(user1).swapTokensForExactETH(
                toWei("10"),
                toWei("1000"),
                [erc.address, weth.address],
                user1.address,
                now + txDelay
            );
            
            finalValue = await ethers.provider.getBalance(user1.address);
            expect(finalValue.sub(initialValue)).to.above(toWei("9.999"));
            expect(finalValue.sub(initialValue)).to.below(toWei("10"));

            const amountIn = getAmountIn(toWei("10"), toWei("1000"), toWei("1000"), 3);

            expect(await erc.balanceOf(user1.address)).to.equal(toWei("1000").sub(amountIn));

        });

        it("should be able to swap exact tokens for ETH", async function () {
            let initialValue: BigNumber, finalValue: BigNumber;

            initialValue = await ethers.provider.getBalance(user1.address);

            await expect(router.connect(user1).swapExactTokensForETH(
                toWei("100"),
                toWei("1"),
                [erc.address, usd.address],
                user1.address,
                now + txDelay
            )).to.revertedWith("FurionSwapV2Router: INVALID_PATH");

            await expect(router.connect(user1).swapExactTokensForETH(
                toWei("100"),
                toWei("100"),
                [erc.address, weth.address],
                user1.address,
                now + txDelay
            )).to.revertedWith("FurionSwapV2Router: INSUFFICIENT_OUTPUT_AMOUNT");

            await router.connect(user1).swapExactTokensForETH(
                toWei("100"),
                toWei("1"),
                [erc.address, weth.address],
                user1.address,
                now + txDelay
            );

            finalValue = await ethers.provider.getBalance(user1.address);
            const amountOut = getAmountOut(toWei("100"), toWei("1000"), toWei("1000"), 3);

            expect(finalValue.sub(initialValue)).to.above(amountOut.sub(toWei("0.1")));
            expect(finalValue.sub(initialValue)).to.below(amountOut);

            expect(await erc.balanceOf(user1.address)).to.equal(toWei("900"));
        });

        it("should be able to swap ETH for exact tokens", async function () {
            let initialValue: BigNumber, finalValue: BigNumber;

            initialValue = await ethers.provider.getBalance(user1.address);

            await expect(router.connect(user1).swapETHForExactTokens(
                toWei("10"),
                [usd.address, weth.address],
                user1.address,
                now + txDelay,
                {value: toWei("10")}
            )).to.revertedWith("FurionSwapV2Router: INVALID_PATH");

            await expect(router.connect(user1).swapETHForExactTokens(
                toWei("10"),
                [weth.address, erc.address],
                user1.address,
                now + txDelay,
                {value: toWei("10")}
            )).to.revertedWith("FurionSwapV2Router: EXCESSIVE_INPUT_AMOUNT");

            await router.connect(user1).swapETHForExactTokens(
                toWei("10"),
                [ weth.address, erc.address],
                user1.address,
                now + txDelay,
                { value: toWei("1000"), }
            );

            const amountIn = getAmountIn(toWei("10"), toWei("1000"), toWei("1000"), 3);

            finalValue = await ethers.provider.getBalance(user1.address);
            expect(initialValue.sub(finalValue)).to.below(amountIn.add(toWei("0.1")));
            expect(initialValue.sub(finalValue)).to.above(amountIn);

            expect(await erc.balanceOf(user1.address)).to.equal(toWei("1010"));

        });

        it("should be able to swap exact ETH for tokens", async function () {
            let initialValue: BigNumber, finalValue: BigNumber;

            initialValue = await ethers.provider.getBalance(user1.address);

            await expect(router.connect(user1).swapExactETHForTokens(
                toWei("10"),
                [usd.address, erc.address],
                user1.address,
                now + txDelay,
                {value: toWei("10")}
            )).to.revertedWith("FurionSwapV2Router: INVALID_PATH");

            await expect(router.connect(user1).swapExactETHForTokens(
                toWei("10"),
                [weth.address, erc.address],
                user1.address,
                now + txDelay,
                {value: toWei("10")}
            )).to.revertedWith("FurionSwapV2Router: INSUFFICIENT_OUTPUT_AMOUNT");

            await router.connect(user1).swapExactETHForTokens(
                toWei("1"),
                [weth.address, erc.address],
                user1.address,
                now + txDelay,
                {value: toWei("10")}
            );

            finalValue = await ethers.provider.getBalance(user1.address);
            const amountOut = getAmountOut(toWei("10"), toWei("1000"), toWei("1000"), 3);

            expect(initialValue.sub(finalValue)).to.above(toWei("10"));
            expect(finalValue.sub(initialValue)).to.below(toWei("10.1"));

            expect(await erc.balanceOf(user1.address)).to.equal(toWei("1000").add(amountOut));
        });
    });

    describe("Transaction fees", function(){
        it("should work well for ERC20 token pairs", async function(){
            await erc.mint(dev.address, toWei("1000"));
            await usd.mint(dev.address, stablecoinToWei("1000"));

            await erc.approve(router.address, toWei("1000"));
            await usd.approve(router.address, stablecoinToWei("1000"));

            now = await getLatestBlockTimestamp(ethers.provider);

            await router.addLiquidity(
                erc.address,
                usd.address,
                toWei("100"),
                stablecoinToWei("100"),
                toWei("80"),
                stablecoinToWei("80"),
                dev.address,
                now + txDelay
            )

            await pair1.approve(router.address, toWei("100000"));

            await erc.mint(user1.address, toWei("1000"));
            await erc.connect(user1).approve(router.address, toWei("1000"));
            await router.connect(user1).swapExactTokensForTokens(
                toWei("100"),
                stablecoinToWei("1"),
                [erc.address, usd.address],
                user1.address,
                now + txDelay
            );

            let reserves = await pair1.getReserves();
            let ercReserve: string, usdReserve: string;
            if(erc.address < usd.address){
                ercReserve = reserves[0].toString();
                usdReserve = reserves[1].toString();
            }else{
                ercReserve = reserves[1].toString();
                usdReserve = reserves[0].toString();
            }
            // console.log(
            //     "      reserves in pool,",
            //     formatTokenAmount(ercReserve),
            //     formatStablecoin(usdReserve)
            // );

            await router.removeLiquidity(
                erc.address,
                usd.address,
                await pair1.balanceOf(dev.address),
                toWei('1'),
                stablecoinToWei('1'),
                dev.address,
                now + txDelay
            );

            let newReserves = await pair1.getReserves();
            let newErcReserve: string, newUsdReserve: string;
            if (erc.address < usd.address) {
                newErcReserve = newReserves[0].toString();
                newUsdReserve = newReserves[1].toString();
            } else {
                newErcReserve = newReserves[1].toString();
                newUsdReserve = newReserves[0].toString();
            }
            // console.log(
            //     "      reserves in pool,",
            //     formatTokenAmount(newErcReserve),
            //     formatStablecoin(newUsdReserve)
            // );

            const diff = parseFloat(formatStablecoin(usdReserve)) - parseFloat(formatStablecoin(newUsdReserve));

            // console.log("Reserve diff", diff);

            expect(100 * 100 / (200 - 0.3) - diff).to.below(0.01);
            expect(100 * 100 / (200 - 0.3) - diff).to.above(-0.01);
        })
    })
})