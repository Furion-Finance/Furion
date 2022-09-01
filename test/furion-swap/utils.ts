import { BigNumber } from "ethers";

export const getAmountOut = (amountIn: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber, fee: number) => {
  const amountInWithFee = amountIn.mul(1000 - fee);

  const denominator = reserveIn.mul(1000);
  const numerator = amountInWithFee.mul(reserveOut);

  const amountOut = numerator.div(denominator.add(amountInWithFee));

  return amountOut;
};

export const getAmountIn = (amountOut: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber, fee: number) => {
  const numerator = reserveIn.mul(amountOut).mul(1000);
  const denominator = reserveOut.sub(amountOut).mul(1000 - fee);

  const amountIn = numerator.div(denominator).add(1);

  return amountIn;
};
