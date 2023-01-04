import BigNumber from 'bignumber.js';
import CurrencyID from '../../../constants/currency';
import { CurrencyPair } from '../../../constants/rates';
import { BaseQuoteByPair, CurrencyPairKey } from '../constants';

const defaultPrecision = 8;

export function toSatoshi(
  fractional: number,
  precision: number = defaultPrecision,
): number {
  return new BigNumber(fractional)
    .multipliedBy(new BigNumber(10).exponentiatedBy(precision))
    .toNumber();
}

export function fromSatoshi(
  sats: number,
  precision: number = defaultPrecision,
): number {
  return new BigNumber(sats)
    .dividedBy(new BigNumber(10).exponentiatedBy(precision))
    .toNumber();
}

export function fromKey(x: CurrencyPairKey): CurrencyPair {
  const [currencyA, currencyB] = x.split('#');
  return [currencyA as CurrencyID, currencyB as CurrencyID];
}

export function baseQuoteFromCurrencyPair(pair: CurrencyPair): CurrencyPair {
  const key = toKey(pair);
  return BaseQuoteByPair[key];
}

export function toKey(x: CurrencyPair): CurrencyPairKey {
  const [currencyA, currencyB] = x;
  return `${currencyA}#${currencyB}`;
}
