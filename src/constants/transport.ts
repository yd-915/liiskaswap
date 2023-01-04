// Transport interface is the new abstraction that allows to decouple
// blockchain and the techcnology used to move, allowing to add easily
// new tokens/currencies of other chains or new tech.
// A Layer could also be shared in common, ie. Lightning is both on BTC and LTC
// this way it's easy to reason about and maintain the separations of concerns.
// This abstraction is useful for components to infer specific dynamic that
// could be specific to a coin used with a specific combo.
// An optional type field has been added to allow distinctions that ony chain/layer
// cannot express by itself, that are specific to that combo. ie. Ether vs ERC20
// or RGB in the context of Bitcoin ecosystem ie. RGB vs OMNI
// In case no distincion is needed, fine to leave it undefined, for example in Liquid
// Liquid Bitcoin has the same exact way of being managed of other assets
export default interface Transport {
  chain: TransportChain;
  layer: TransportLayer;
  extraType?: TransportExtraType;
}

// we list here all the possible chains we can support. We can easily adds many more
// altcoins blockchains decoupling from the layer or the token/currency.
// ie. Tether lives on many chains already
export enum TransportChain {
  BITCOIN = 0,
  ETHEREUM = 1,
  LIQUID = 2,
  LITECOIN = 3,
  MONERO = 4,
}

// the same token/currency can live on many layers of the same chain
// many different layers that are specific of a single blockchain can
// be added easily.
export enum TransportLayer {
  ONCHAIN = 0,
  LIGHTNING = 1,
}

export enum TransportExtraType {
  Ether = 0,
  ERC20 = 1,
  Omni = 2,
  RGB = 3,
}
