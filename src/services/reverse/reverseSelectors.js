export const selectReverseReducer = state => {
  return state.reverseReducer;
};

export const selectReverseSwapDetails = state => {
  const reverse = selectReverseReducer(state);
  return reverse.swapDetails;
};

export const selectClaimTransactionId = state => {
  const reverse = selectReverseReducer(state);
  return reverse.claimTransactionId;
};

export const selectEthereumPrepayMinerFee = state => {
  const reverse = selectReverseReducer(state);
  return reverse.ethereumPrepayMinerFee;
};

export const selectEthereumPrepayMinerFeePaid = state => {
  return selectReverseReducer(state).ethereumPrepayMinerFeePaid;
};
