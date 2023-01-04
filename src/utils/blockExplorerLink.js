import { explorers } from '../constants/environment';

export const getBlockExplorerTransactionLink = (symbol, transactionId) => {
  let blockExplorer;

  switch (symbol) {
    case 'BTC':
      blockExplorer = explorers.bitcoin;
      break;

    case 'LTC':
      blockExplorer = explorers.litecoin;
      break;

    default:
      blockExplorer = explorers.ethereum;
      break;
  }

  return `${blockExplorer.transaction}${transactionId}`;
};
