import BigNumber from 'bignumber.js';
import { CurrencyTypes, SwapTypes } from '../../constants/submarine';

const decimals = new BigNumber('100000000');

const getSwapType = (sendCurrency, receiveCurrency) => {
  const sendingOnLightning = sendCurrency.swapValues.type === CurrencyTypes.Lightning;
  const receiveOnLightning = receiveCurrency.swapValues.type === CurrencyTypes.Lightning;

  if (!sendingOnLightning && receiveOnLightning) {
    return SwapTypes.Submarine;
  } else if (sendingOnLightning && !receiveOnLightning) {
    return SwapTypes.ReverseSubmarine;
  } else if (!sendingOnLightning && !receiveOnLightning) {
    return SwapTypes.ChainToChain;
  }

  return undefined;
};

/**
 * Calculates the miner fees for Swap denominated in the sending currency
 *
 * There are three kinds of Swaps with different kinds of miner fees:
 * - Submarine: locking funds on the chain the user is sending on
 * - Reverse Submarine: locking funds on the chain the user is receiving on (Boltz charges for that) and claiming on the same chain
 * - Chain to Chain (not implemented yet): locking and claiming on both chains
 *
 * @returns {number}
 */
export const calculateMinerFee = (
  pair,
  sendCurrency,
  receiveCurrency,
  isMirrorPair,
  effectiveRate,
) => {
  if (!pair) {
    return 0;
  }

  const minerFees = pair.fees.minerFees;
  const sendMinerFees = isMirrorPair
    ? minerFees.quoteAsset
    : minerFees.baseAsset;
  const receiveMinerFees = isMirrorPair
    ? minerFees.baseAsset
    : minerFees.quoteAsset;

  let fees;

  switch (getSwapType(sendCurrency, receiveCurrency)) {
    case SwapTypes.Submarine:
      fees = sendMinerFees.normal;
      break;

    case SwapTypes.ReverseSubmarine:
      const { claim, lockup } = receiveMinerFees.reverse;
      // We take these values from the receiving currency but display it in the sending one
      // Therefore, we need to divide by the effective rate which is {sendingCurrency / receivingCurrency}
      fees = (claim + lockup) / effectiveRate;
      break;

    default:
      fees = new BigNumber(0);
      break;
  }

  const feesInWholeCoins = new BigNumber(fees).dividedBy(decimals);
  return feesInWholeCoins.isZero() ? 0 : feesInWholeCoins.toFixed(8);
};
