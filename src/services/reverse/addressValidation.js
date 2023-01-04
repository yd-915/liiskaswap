import { address } from 'bitcoinjs-lib';

export const isAddressValid = (input, network) => {
  const swapAddress = input.trim();

  if (input !== '') {
    try {
      address.toOutputScript(swapAddress, network);
      return true;
    } catch (error) {
      return false;
    }
  }

  return false;
};
