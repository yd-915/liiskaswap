import { Networks } from 'boltz-core';

export const SwapUpdateEvent = {
  InvoicePaid: 'invoice.paid',
  InvoiceSettled: 'invoice.settled',
  InvoiceSet: 'invoice.set',
  InvoiceFailedToPay: 'invoice.failedToPay',
  InvoicePending: 'invoice.pending',

  TransactionFailed: 'transaction.failed',
  TransactionMempool: 'transaction.mempool',
  TransactionClaimed: 'transaction.claimed',
  TransactionRefunded: 'transaction.refunded',
  TransactionConfirmed: 'transaction.confirmed',

  ChannelCreated: 'channel.created',

  MinerFeePaid: 'minerfee.paid',

  SwapExpired: 'swap.expired',
};

const capitalizeFirstLetter = input => {
  return input.charAt(0).toUpperCase() + input.slice(1);
};

/**
 * Values from the environment
 */

// Network configurations
export const network = process.env.REACT_APP_NETWORK.toLowerCase();

export const bitcoinNetwork = Networks[`bitcoin${capitalizeFirstLetter(network)}`];
export const litecoinNetwork = Networks[`litecoin${capitalizeFirstLetter(network)}`];

export const explorers = {
  bitcoin: {
    address: process.env.REACT_APP_EXPLORER_BITCOIN_ADDRESS,
    transaction: process.env.REACT_APP_EXPLORER_BITCOIN_TRANSACTION,
  },
  litecoin: {
    address: process.env.REACT_APP_EXPLORER_LITECOIN_ADDRSESS,
    transaction: process.env.REACT_APP_EXPLORER_LITECOIN_TRANSACTION,
  },
  ethereum: {
    address: process.env.REACT_APP_EXPLORER_ETHEREUM_ADDRESS,
    transaction: process.env.REACT_APP_EXPLORER_ETHEREUM_TRANSACTION,
  },
};

export const infuraId = process.env.REACT_APP_INFURA_ID;

// Onion URL
export const boltzOnion = process.env.REACT_APP_BOLTZ_ONION;

// API endpoint; will be set to the onion endpoint if Boltz is accessed via Tor
const splitHost = window.location.hostname.split('.');

if (splitHost[0] === 'www') {
  splitHost.shift();
}

export const boltzApi = splitHost[1] !== 'onion'
  ? process.env.REACT_APP_BOLTZ_API
  : process.env.REACT_APP_BOLTZ_API_ONION;

// Demo YouTube video
export const demoVideoUrl = process.env.REACT_APP_DEMO_VIDEO_URL;

// FAQ page
export const faqUrl = process.env.REACT_APP_FAQ;

export const LocalStorageState = {
  ActiveSwap: 'activeSwap',
  CurrentSubmarineState: 'currentSubmarineState',
  CurrentReverseState: 'currentReverseState',
  ExtraDetails: 'extraDetails',
};
