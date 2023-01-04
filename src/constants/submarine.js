import Destination from '../views/submarine/destination';
import PickCrypto from '../views/submarine/pickCrypto';
import Send from '../views/submarine/send';
import Status from '../views/submarine/status';

export const SwapTypes = {
  Submarine: 'Submarine',
  ReverseSubmarine: 'ReverseSubmarine',
  ChainToChain: 'ChainToChain',
};

export const CurrencyTypes = {
  Ether: 'Ether',
  ERC20: 'ERC20',
  Lightning: 'Lightning',
  BitcoinLike: 'BitcoinLike',
};

// These CurrencyTypes are on the Ethereum chain
const EthereumCurrencyTypes = [CurrencyTypes.Ether, CurrencyTypes.ERC20];

export const isEthereumCurrencyType = currencyType => {
  return EthereumCurrencyTypes.includes(currencyType);
};

export const isLightningCurrencyType = currencyType => {
  return currencyType === CurrencyTypes.Lightning;
};

export const satConversionValue = 100000000;

export const SubmarineSteps = [
  {
    key: 0,
    label: 'Choose',
    component: PickCrypto,
  },
  {
    key: 1,
    label: 'Destination',
    component: Destination,
  },
  {
    key: 2,
    label: 'Send',
    component: Send,
  },
  {
    key: 3,
    label: 'Status',
    component: Status,
  },
];

export const fundTransferTypes = {
  BTC: [
    {
      id: 'Sats',
      value: '1',
    },
    {
      id: 'BTC',
      value: '2',
    },
  ],
  LTC: [
    {
      id: 'Litoshi',
      value: '1',
    },
    {
      id: 'LTC',
      value: '2',
    },
  ],
  ETH: [
    {
      id: 'Ether',
      value: '2',
    },
  ],
  USDT: [
    {
      id: 'USDT',
      value: '2',
    },
  ],
};
