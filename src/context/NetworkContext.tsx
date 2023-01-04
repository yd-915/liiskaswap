import { Network as NetworkConstants } from 'bitcoinjs-lib';
import { Networks } from 'boltz-core';
import React from 'react';
import CurrencyID from '../constants/currency';

enum Network {
  Mainnet = 'MAINNET',
  Testnet = 'TESTNET',
  Regtest = 'REGTEST',
}

type BlockExplorerConfiguration = {
  address: string;
  transaction: string;
};

export type BoltzConfiguration = {
  infuraId: string;
  apiEndpoint: string;

  bitcoinConstants: NetworkConstants;
  litecoinConstants: NetworkConstants;
};

type NetworkContextData = {
  network: Network;
  setNetwork: (network: Network) => void;
};

const defaultNetwork = Network.Testnet;
/*
  window.location.hostname === 'opendex.app'
    ? Network.Mainnet
    : window.location.hostname === 'staging.opendex.app'
    ? Network.Testnet
    : Network.Regtest;
*/

const NetworkContext = React.createContext<NetworkContextData>({
  network: defaultNetwork,
  setNetwork: () => {},
});

const NetworkProvider = ({ children }) => {
  const [network, setNetwork] = React.useState<Network>(defaultNetwork);

  return (
    <NetworkContext.Provider
      value={{
        network,
        setNetwork,
      }}
    >
      <>{children}</>
    </NetworkContext.Provider>
  );
};

const useNetwork = (): NetworkContextData => {
  return React.useContext(NetworkContext);
};

const useBlockExplorers = (): Map<string, BlockExplorerConfiguration> => {
  const { network } = React.useContext(NetworkContext);

  const explorers = new Map<string, BlockExplorerConfiguration>();

  for (const currency of Object.keys(CurrencyID)) {
    const blockExplorer: BlockExplorerConfiguration = {
      address: process.env[`REACT_APP_${network}_EXPLORER_${currency}_ADDRESS`]!,
      transaction: process.env[`REACT_APP_${network}_EXPLORER_${currency}_TRANSACTION`]!,
    };

    if (
      blockExplorer.address !== undefined
      && blockExplorer.transaction !== undefined
    ) {
      explorers.set(currency, blockExplorer);
    }
  }

  return explorers;
};

const useBoltzConfiguration = (): BoltzConfiguration => {
  const { network } = React.useContext(NetworkContext);

  const capitalizeFirstLetter = (input: string) => {
    return input.charAt(0).toUpperCase() + input.slice(1);
  };

  return {
    apiEndpoint: process.env[`REACT_APP_BOLTZ_${network}_API`]!,
    infuraId: process.env[`REACT_APP_BOLTZ_${network}_INFURA_ID`]!,

    bitcoinConstants: Networks[`bitcoin${capitalizeFirstLetter(network.toLowerCase())}`],
    litecoinConstants: Networks[`litecoin${capitalizeFirstLetter(network.toLowerCase())}`],
  };
};

export { Network, NetworkProvider, useBlockExplorers, useBoltzConfiguration, useNetwork };
