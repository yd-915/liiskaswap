import Decimal from 'decimal.js';
import { Network } from '../../context/NetworkContext';
import { BitcoinAmount } from './BitcoinAmount';

// TODO: Community member to provide mainnet params
const MAINNET: AsbParams = {
  maxAccepted: BitcoinAmount.fromBtc(0),
  minAccepted: BitcoinAmount.fromBtc(0),
  multiaddr: '',
  peerId: '',
  spread: new Decimal(0),
};

const TESTNET: AsbParams = {
  maxAccepted: BitcoinAmount.fromBtc(0.02),
  minAccepted: BitcoinAmount.fromBtc(0.002),
  multiaddr: '/onion3/pzbmpqsyi2j2za2fwmiognupwozjlcoajbd3cgboetql7ooah63zywqd:9939',
  peerId: '12D3KooWCdMKjesXMJz1SiZ7HgotrxuqhQJbP5sgBm2BwP1cqThi',
  spread: new Decimal(0.02),
};

export function fromKrakenPriceToQuote(
  price: BitcoinAmount,
  network: Network,
): Quote {
  let withSpreadDec = new Decimal(1).add(getSpread(network)).mul(price.asBtc());
  let withSpread = BitcoinAmount.fromBtc(withSpreadDec.toString());

  return {
    max_quantity: getMax(network),
    min_quantity: getMin(network),
    price: withSpread,
    timestamp: new Date(),
  };
}

export function getPeerId(network: Network): string {
  return network === Network.Mainnet ? MAINNET.peerId : TESTNET.peerId;
}

export function getMultiaddr(network: Network): string {
  return network === Network.Mainnet ? MAINNET.multiaddr : TESTNET.multiaddr;
}

function getSpread(network: Network): Decimal {
  return network === Network.Mainnet ? MAINNET.spread : TESTNET.spread;
}

function getMin(network: Network): BitcoinAmount {
  return network === Network.Mainnet
    ? MAINNET.minAccepted
    : TESTNET.minAccepted;
}

function getMax(network: Network): BitcoinAmount {
  return network === Network.Mainnet
    ? MAINNET.maxAccepted
    : TESTNET.maxAccepted;
}

export interface Quote {
  price: BitcoinAmount;
  min_quantity: BitcoinAmount;
  max_quantity: BitcoinAmount;
  timestamp: Date;
}

interface AsbParams {
  multiaddr: string;
  peerId: string;
  minAccepted: BitcoinAmount;
  maxAccepted: BitcoinAmount;
  spread: Decimal;
}
