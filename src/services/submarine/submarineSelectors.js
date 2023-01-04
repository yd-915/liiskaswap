export const selectSubmarineReducer = state => {
  return state.submarineReducer;
};

export const selectPairId = state => {
  const submarine = selectSubmarineReducer(state);
  return submarine.pairId;
};

export const selectOrderSide = state => {
  const submarine = selectSubmarineReducer(state);
  return submarine.orderSide;
};

export const selectInvoice = state => {
  const submarine = selectSubmarineReducer(state);
  return submarine.invoice;
};

export const selectSwapDetails = state => {
  const submarine = selectSubmarineReducer(state);
  return submarine.swapDetails.data;
};

export const selectSwapStatus = state => {
  const submarine = selectSubmarineReducer(state);
  return submarine.swapStatus;
};

export const selectPairDetails = state => {
  const submarine = selectSubmarineReducer(state);
  return submarine.pairs;
};

export const selectContracts = state => {
  const submarine = selectSubmarineReducer(state);
  return submarine.contracts;
};

export const selectSendCurrency = state => {
  const submarine = selectSubmarineReducer(state);
  return submarine.sendCurrency;
};

export const selectReceiveCurrency = state => {
  const submarine = selectSubmarineReducer(state);
  return submarine.receiveCurrency;
};

export const selectChannelCreation = state => {
  return selectSubmarineReducer(state).channelCreation;
};
