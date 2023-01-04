import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal, { IProviderOptions } from 'web3modal';

export const createWeb3Modal = async (
  ethereumNetworkName: string,
  infuraId: string,
) => {
  const providerOptions: IProviderOptions = {};

  // If the backend sets a network name, it is a public one on which WalletConnect can be used
  if (ethereumNetworkName !== undefined) {
    providerOptions.walletconnect = {
      package: WalletConnectProvider,
      options: {
        infuraId,
      },
    };
  }

  return new Web3Modal({
    providerOptions,
    cacheProvider: true,
    theme: 'dark',
    network: ethereumNetworkName,
  });
};
