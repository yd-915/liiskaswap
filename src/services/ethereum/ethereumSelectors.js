export const selectEthereumReducer = state => {
  return state.ethereumReducer;
};

export const selectSigner = state => {
  return selectEthereumReducer(state).signer;
};
