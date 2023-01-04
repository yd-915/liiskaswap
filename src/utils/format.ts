import { Decimal } from 'decimal.js';

const defaultPrecision = 8;

export function toSatoshi(x: number, y: number = defaultPrecision): number {
  return new Decimal(x).mul(Decimal.pow(10, y)).toNumber();
}

export function fromSatoshi(
  sats: number,
  precision: number = defaultPrecision,
): number {
  return new Decimal(sats).div(Decimal.pow(10, precision)).toNumber();
}
