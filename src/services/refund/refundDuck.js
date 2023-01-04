import { address, ECPair, Transaction } from 'bitcoinjs-lib';
import { constructRefundTransaction, detectSwap } from 'boltz-core';
import qrcodeParser from 'qrcode-parser';
import { BROADCAST_TRANSACTION, GET_FEE_ESTIMATION, GET_SWAP_TRANSACTION } from '../../api/apiUrls';
import { bitcoinNetwork, litecoinNetwork } from '../../constants/environment';
import { CurrencyTypes } from '../../constants/submarine';
import { RESET_STATE } from '../reverse/reverseDuck';

export const SET_REFUND_FILE = 'SET_REFUND_FILE';
export const SET_ID = 'SET_ID';
export const ERROR_REFUND_MESSAGE = 'ERROR_REFUND_MESSAGE';
export const SUCCESS_REFUND = 'SUCCESS_REFUND';
export const SET_ETA = 'SET_ETA';
export const SET_TRANSACTION_HASH = 'SET_TRANSACTION_HASH';

export const CLEAR = 'CLEAR_REFUND';

const refundInitialState = {
  id: '',
  file: {
    status: false,
    details: {},
  },
};

export const setID = id => {
  return {
    type: SET_ID,
    id,
  };
};

export const setRefundFile = payload => {
  return {
    type: SET_REFUND_FILE,
    payload,
  };
};

export const errorRefundMessage = error => {
  return {
    type: ERROR_REFUND_MESSAGE,
    error,
  };
};

export const successfulRefund = () => {
  return {
    type: SUCCESS_REFUND,
  };
};

export const setEta = eta => {
  return {
    type: SET_ETA,
    eta,
  };
};

export const setTransactionHash = transactionHash => {
  return {
    type: SET_TRANSACTION_HASH,
    transactionHash,
  };
};

export const clearRefundState = () => {
  return {
    type: RESET_STATE,
  };
};

export const refundReducer = (state = refundInitialState, action) => {
  switch (action.type) {
    case SET_ID: {
      return {
        ...state,
        id: action.id,
        file: {
          status: false,
          details: {},
        },
      };
    }
    case SET_REFUND_FILE: {
      return {
        ...state,
        id: '',
        file: {
          status: true,
          details: action.payload,
        },
      };
    }

    case ERROR_REFUND_MESSAGE: {
      return {
        ...state,
        error: action.error,
      };
    }

    case SUCCESS_REFUND: {
      return {
        ...state,
        error: '',
      };
    }

    case SET_ETA: {
      return {
        ...state,
        eta: action.eta,
      };
    }

    case SET_TRANSACTION_HASH: {
      return {
        ...state,
        transactionHash: action.transactionHash,
      };
    }

    case RESET_STATE: {
      return refundInitialState;
    }

    default:
      return state;
  }
};

const verifyRefundFile = (fileJSON, keys) => {
  return keys.every(key => Object.prototype.hasOwnProperty.call(fileJSON, key));
};

const uploadRefundFile = async (file, dispatch) => {
  let fileJson;

  switch (file.type) {
    case 'application/json':
      const reader = new window.FileReader();
      reader.readAsText(file);

      await new Promise(resolve => {
        reader.onload = () => {
          fileJson = JSON.parse(reader.result);
          resolve();
        };
      });
      break;

    case 'image/png':
      const parsedQr = await qrcodeParser(file);
      fileJson = JSON.parse(parsedQr.data);
      break;

    default:
      window.alert(`Unknown refund file format: ${file.type}`);
      return;
  }

  const verifyFile = verifyRefundFile(fileJson, [
    'currency',
    'redeemScript',
    'privateKey',
    'timeoutBlockHeight',
  ]);

  dispatch(setRefundFile(verifyFile ? fileJson : {}));
};

export const refundFileUploadHandler = (file, dispatch) => {
  uploadRefundFile(file, dispatch);
};

export const checkStatus = (id, dispatch, nextStepCallback) => {
  // startListening(dispatch, id, nextStepCallback);
  fetch(GET_SWAP_TRANSACTION, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({
      id,
    }),
  })
    .then(res => res.json())
    .then(async swapTransactionRes => {
      const {
        transactionHex: transactionHash,
        timeoutEta = 0,
        error,
      } = swapTransactionRes;
      if (error) {
        dispatch(errorRefundMessage(error));
        nextStepCallback({});
        nextStepCallback({});
      } else {
        dispatch(setEta(timeoutEta));

        await dispatch(setTransactionHash(transactionHash));
        nextStepCallback(swapTransactionRes);
      }
    })
    .catch(error => {
      console.error('Get swap transaction error: ', error);
      dispatch(errorRefundMessage('Failed to get status'));
      nextStepCallback({});
      nextStepCallback({});
    });
};

export const getFeeEstimation = async () => {
  const data = await fetch(GET_FEE_ESTIMATION);
  return data.json();
};

export const getHexBuffer = input => {
  return Buffer.from(input, 'hex');
};

export const getNetwork = symbol => {
  return symbol === 'BTC' ? bitcoinNetwork : litecoinNetwork;
};

const createRefundTransaction = (
  refundFile,
  transactionHash,
  destinationAddress,
  currency,
  feeEstimation,
) => {
  const redeemScript = getHexBuffer(refundFile.redeemScript);
  const lockupTransaction = Transaction.fromHex(transactionHash);

  return {
    refundTransaction: constructRefundTransaction(
      [
        {
          redeemScript,
          txHash: lockupTransaction.getHash(),
          keys: ECPair.fromPrivateKey(getHexBuffer(refundFile.privateKey)),
          ...detectSwap(redeemScript, lockupTransaction),
        },
      ],
      address.toOutputScript(destinationAddress, getNetwork(currency)),
      refundFile.timeoutBlockHeight,
      feeEstimation[currency],
    ),
    lockupTransactionId: lockupTransaction.getId(),
  };
};

export const startRefund = async (
  refundFile,
  destinationAddress,
  transactionHash,
  cb,
  dispatch,
) => {
  // Lightning refunds are happening automatically which means that only onchain assets can be refunded in the frontend
  if (refundFile.type !== CurrencyTypes.BitcoinLike) {
    const { data } = refundFile;

    try {
      if (refundFile.type === CurrencyTypes.Ether) {
        await refundFile.contract.refund(
          data.preimageHash,
          data.amount,
          data.claimAddress,
          data.timelock,
        );
      } else {
        await refundFile.contract.refund(
          data.preimageHash,
          data.amount,
          data.tokenAddress,
          data.claimAddress,
          data.timelock,
        );
      }

      dispatch(successfulRefund());
      cb();

      // If the refund transaction fails, the user aborted it in 99% of the cases
      // TODO: proper error handling in case the actual transaction failed
    } catch (_) {}
  } else {
    const currency = refundFile.currency;
    const feeEstimation = await getFeeEstimation();

    try {
      const { refundTransaction } = createRefundTransaction(
        refundFile,
        transactionHash,
        destinationAddress,
        currency,
        feeEstimation,
      );
      broadcastRefund(currency, refundTransaction.toHex(), cb, dispatch);
    } catch {
      dispatch(errorRefundMessage('Failed to refund swap'));
      cb();
    }
  }
};

export const broadcastRefund = (currency, transactionHex, cb, dispatch) => {
  fetch(BROADCAST_TRANSACTION, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({
      currency,
      transactionHex,
    }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw data.error;
      }
      return data;
    })
    .then(() => {
      dispatch(successfulRefund());
    })
    .catch(response => {
      console.error('Broadcast failed: ', response);
      dispatch(errorRefundMessage('Failed to broadcast transaction'));
    })
    .then(cb);
};
