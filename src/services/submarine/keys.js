import { ECPair } from 'bitcoinjs-lib';

export const getHexString = input => {
  return input.toString('hex');
};

export const generateKeys = network => {
  const keys = ECPair.makeRandom({ network });

  return {
    publicKey: getHexString(keys.publicKey),
    privateKey: getHexString(keys.privateKey),
  };
};
