import { timeDiffCalc } from './timestamp';

export const selectRefundReducer = state => {
  return state.refundReducer;
};

export const selectSwapId = state => {
  const refund = selectRefundReducer(state);
  return refund.id;
};

export const selectFile = state => {
  const refund = selectRefundReducer(state);
  return refund.file;
};

export const selectFileStatus = state => {
  const file = selectFile(state);
  return file.status;
};

export const selectFileDetails = state => {
  const file = selectFile(state);
  return file.details;
};

export const selectETA = state => {
  const refund = selectRefundReducer(state);
  const d1 = new Date();
  const d2 = new Date(refund.eta * 1000);
  const { label, value } = timeDiffCalc(d2, d1);
  return {
    label,
    eta: value > 0 ? value : 0,
  };
};

export const selectError = state => {
  const refund = selectRefundReducer(state);
  return refund.error || '';
};

export const selectTransactionHash = state => {
  const refund = selectRefundReducer(state);
  return refund.transactionHash;
};
