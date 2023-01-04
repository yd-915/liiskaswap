import { BigNumber } from 'ethers';

/**
 * Formats the token amount to send from 10 ** -8 decimals
 */
export const formatTokenAmount = (
  decimals: number,
  amount: number,
): BigNumber => {
  const amountBn = BigNumber.from(amount);

  if (decimals === 8) {
    return amountBn;
  } else {
    const exponent = BigNumber.from(10).pow(
      BigNumber.from(Math.abs(decimals - 8)),
    );

    if (decimals > 8) {
      return amountBn.mul(exponent);
    } else {
      return amountBn.div(exponent);
    }
  }
};

/**
 * Normalizes the token balance to 10 ** -8 decimals
 */
export const normalizeTokenAmount = (decimals: number, amount: BigNumber) => {
  if (decimals === 8) {
    return amount;
  } else {
    const exponent = BigNumber.from(10).pow(
      BigNumber.from(Math.abs(decimals - 8)),
    );

    if (decimals > 8) {
      return amount.div(exponent);
    } else {
      return amount.mul(exponent);
    }
  }
};
