import { MarketInterface } from 'tdex-sdk';
import CurrencyID from '../../../constants/currency';
import { CurrencyPair } from '../../../constants/rates';

export const ExplorerByChain: Record<'liquid' | 'regtest', string> = {
  liquid: 'https://blockstream.info/liquid/api',
  regtest: 'http://localhost:3001',
};

export const EsploraByChain: Record<'liquid' | 'regtest', string> = {
  liquid: 'https://blockstream.info/liquid',
  regtest: 'http://localhost:5001',
};

export interface Provider {
  name: string;
  endpoint: string;
}

export interface ProviderWithMarket {
  provider: Provider;
  market: MarketInterface;
}

export interface PriceWithFee {
  amount: number;
  asset: string;
  balance: any;
  fee: any;
  price: any;
}

interface AssetInfo {
  hash: string;
  precision: number;
}

type AssetByCurrency = Record<
  CurrencyID.LIQUID_BTC | CurrencyID.LIQUID_USDT | CurrencyID.LIQUID_CAD,
  AssetInfo
>;

type CurrencyByAsset = Record<
  string,
  CurrencyID.LIQUID_BTC | CurrencyID.LIQUID_USDT | CurrencyID.LIQUID_CAD
>;

const LIQUID_BTC_REGTEST = '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225';
const LIQUID_BTC = '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d';
const LIQUID_USDT = 'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2';
const LIQUID_CAD = '0e99c1a6da379d1f4151fb9df90449d40d0608f6cb33a5bcbfc8c265f42bab0a';

export type CurrencyPairKey = string;

export const LBTC_USDT = `${CurrencyID.LIQUID_BTC}#${CurrencyID.LIQUID_USDT}`;
export const USDT_LBTC = `${CurrencyID.LIQUID_USDT}#${CurrencyID.LIQUID_BTC}`;
export const LBTC_LCAD = `${CurrencyID.LIQUID_BTC}#${CurrencyID.LIQUID_CAD}`;
export const LCAD_LBTC = `${CurrencyID.LIQUID_CAD}#${CurrencyID.LIQUID_BTC}`;

export const BaseQuoteByPair: Record<CurrencyPairKey, CurrencyPair> = {
  [LBTC_USDT]: [CurrencyID.LIQUID_BTC, CurrencyID.LIQUID_USDT],
  [USDT_LBTC]: [CurrencyID.LIQUID_BTC, CurrencyID.LIQUID_USDT],
  [LBTC_LCAD]: [CurrencyID.LIQUID_BTC, CurrencyID.LIQUID_CAD],
  [LCAD_LBTC]: [CurrencyID.LIQUID_BTC, CurrencyID.LIQUID_CAD],
};

const LiquidAssetHashByCurrenyID: AssetByCurrency = {
  [CurrencyID.LIQUID_BTC]: {
    hash: LIQUID_BTC,
    precision: 8,
  },
  [CurrencyID.LIQUID_USDT]: {
    hash: LIQUID_USDT,
    precision: 8,
  },
  [CurrencyID.LIQUID_CAD]: {
    hash: LIQUID_CAD,
    precision: 8,
  },
};

const RegtestAssetHashByCurrenyID: AssetByCurrency = {
  [CurrencyID.LIQUID_BTC]: {
    hash: LIQUID_BTC_REGTEST,
    precision: 8,
  },
  [CurrencyID.LIQUID_USDT]: {
    hash: process.env.REACT_APP_LIQUID_USDT_REGTEST!,
    precision: 8,
  },
  [CurrencyID.LIQUID_CAD]: {
    hash: process.env.REACT_APP_LIQUID_CAD_REGTEST!,
    precision: 8,
  },
};

const LiquidCurrencyIDByAssetHash: CurrencyByAsset = {
  [LIQUID_BTC]: CurrencyID.LIQUID_BTC,
  [LIQUID_USDT]: CurrencyID.LIQUID_USDT,
  [LIQUID_CAD]: CurrencyID.LIQUID_CAD,
};

const RegtestCurrencyIDByAssetHash: CurrencyByAsset = {
  [LIQUID_BTC_REGTEST]: CurrencyID.LIQUID_BTC,
  [process.env.REACT_APP_LIQUID_USDT_REGTEST!]: CurrencyID.LIQUID_USDT,
  [process.env.REACT_APP_LIQUID_CAD_REGTEST!]: CurrencyID.LIQUID_CAD,
};

export const CurrencyToAssetByChain: Record<
  'liquid' | 'regtest',
  AssetByCurrency
> = {
  liquid: LiquidAssetHashByCurrenyID,
  regtest: RegtestAssetHashByCurrenyID,
};

export const AssetToCurrencyByChain: Record<
  'liquid' | 'regtest',
  CurrencyByAsset
> = {
  liquid: LiquidCurrencyIDByAssetHash,
  regtest: RegtestCurrencyIDByAssetHash,
};
