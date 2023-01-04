import {
  CREATE_SWAP,
  GET_CONTRACTS,
  GET_PAIRS,
  STREAM_SWAP_STATUS,
  SWAP_STATUS as SWAP_STATUS_API,
} from '../../api/apiUrls';
import { LocalStorageState, SwapUpdateEvent } from '../../constants/environment';
import { RESET_STATE, setEthereumPrepayMinerFeePaid } from '../reverse/reverseDuck';

const FETCH_PAIRS = 'FETCH_PAIRS';
const FETCHED_PAIRS = 'FETCHED_PAIRS';
const FETCHED_CONTRACTS = 'FETCHED_CONTRACTS';
const FETCHING_PAIRS = 'FETCHING_PAIRS';
const SET_PAIR_VALUES = 'SET_PAIR_VALUES';
const ERROR_FETCHING_PAIRS = 'ERROR_FETCHING_PAIRS';
const UPDATE_INVOICE = 'UPDATE_INVOICE';
const UPDATE_SWAP_DETAILS = 'UPDATE_SWAP_DETAILS';
const FETCHING_SWAP_DETAILS = 'FETCHING_SWAP_DETAILS';
const SWAP_STATUS = 'SWAP_STATUS';
const SET_CHANNEL_CREATION = 'SET_CHANNEL_CREATION';
const CLEAR_CHANNEL_CREATION = 'CLEAR_CHANNEL_CREATION';

const currentSubmarineState = JSON.parse(
  localStorage.getItem(LocalStorageState.CurrentSubmarineState),
);
const initialState = {
  ...{
    pairs: {},
    contracts: {
      ethereum: {},
    },

    pairId: '',
    orderSide: '',
    sendCurrency: {},
    receiveCurrency: {},

    invoice: '',
    swapDetails: {
      loading: false,
      data: {},
      error: '',
    },
    swapStatus: {},
    channelCreation: undefined,
  },
  ...currentSubmarineState,
};

/* Action Creators */
export const fetchPairs = () => ({
  type: FETCH_PAIRS,
});

export const fetchingPairs = () => ({
  type: FETCHING_PAIRS,
});

export const fetchedPairs = data => ({
  type: FETCHED_PAIRS,
  data,
});

export const fetchedContracts = data => ({
  type: FETCHED_CONTRACTS,
  data,
});

export const setPairValues = data => ({
  type: SET_PAIR_VALUES,
  data,
});

export const errorFetchingPairs = () => ({
  type: ERROR_FETCHING_PAIRS,
});

export const updateInvoice = data => ({
  type: UPDATE_INVOICE,
  data,
});

export const updateSwapDetails = data => ({
  type: UPDATE_SWAP_DETAILS,
  data,
});

export const setSwapStatus = status => ({
  type: SWAP_STATUS,
  status,
});

export const setChannelCreation = data => ({
  type: SET_CHANNEL_CREATION,
  data,
});

export const clearChannelCreation = () => ({
  type: CLEAR_CHANNEL_CREATION,
});

/* Reducers */

export const submarineReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCHED_PAIRS:
      localStorage.setItem(
        LocalStorageState.CurrentSubmarineState,
        JSON.stringify({
          ...state,
          pairs: action.data,
          loading: false,
        }),
      );
      return {
        ...state,
        pairs: action.data,
        loading: false,
      };

    case FETCHED_CONTRACTS:
      localStorage.setItem(
        LocalStorageState.CurrentSubmarineState,
        JSON.stringify({
          ...state,
          contracts: action.data,
        }),
      );
      return {
        ...state,
        contracts: action.data,
      };

    case FETCH_PAIRS:
      return {
        ...state,
        loading: true,
      };

    case SET_PAIR_VALUES:
      localStorage.setItem(
        LocalStorageState.CurrentSubmarineState,
        JSON.stringify({
          ...state,
          ...action.data,
        }),
      );
      return {
        ...state,
        ...action.data,
      };

    case UPDATE_INVOICE:
      localStorage.setItem(
        LocalStorageState.CurrentSubmarineState,
        JSON.stringify({
          ...state,
          invoice: action.data,
        }),
      );
      return {
        ...state,
        invoice: action.data,
      };

    case FETCHING_SWAP_DETAILS:
      return {
        ...state,
        swapDetails: {
          loading: true,
          data: {},
        },
      };

    case UPDATE_SWAP_DETAILS:
      localStorage.setItem(
        LocalStorageState.CurrentSubmarineState,
        JSON.stringify({
          ...state,
          swapDetails: {
            loading: false,
            data: action.data,
          },
        }),
      );
      return {
        ...state,
        swapDetails: {
          loading: false,
          data: action.data,
        },
      };

    case SWAP_STATUS:
      localStorage.setItem(
        LocalStorageState.CurrentSubmarineState,
        JSON.stringify({
          ...state,
          swapStatus: action.status,
        }),
      );
      return {
        ...state,
        swapStatus: action.status,
      };

    case CLEAR_CHANNEL_CREATION:
      return {
        ...state,
        channelCreation: undefined,
      };

    case RESET_STATE:
      // TODO: update for refactor
      localStorage.removeItem(LocalStorageState.ActiveSwap);
      localStorage.removeItem(LocalStorageState.ExtraDetails);
      localStorage.removeItem(LocalStorageState.CurrentSubmarineState);
      localStorage.removeItem(LocalStorageState.CurrentReverseState);
      return {
        ...state,
        send: 0,
        receive: 0,
        invoice: '',
        sendCurrencyLabel: 'A',
        receiveCurrencyLabel: 'B',
        swapDetails: {
          loading: false,
          data: {},
          error: '',
        },
        swapStatus: {},
        channelCreation: undefined,
      };

    case SET_CHANNEL_CREATION:
      return {
        ...state,
        channelCreation: action.data,
      };

    default:
      return state;
  }
};

export const getPairs = dispatch => {
  dispatch(fetchPairs());

  const handleFailure = () => {
    dispatch(fetchedPairs(undefined));
  };

  fetch(GET_PAIRS)
    .then(pairsResponse => {
      fetch(GET_CONTRACTS)
        .then(contractsResponse => contractsResponse.json())
        .catch(handleFailure)
        .then(contractsData => {
          dispatch(fetchedContracts(contractsData));

          pairsResponse
            .json()
            .then(pairsData => {
              dispatch(fetchedPairs(pairsData.pairs));
            })
            .catch(handleFailure);
        })
        .catch(handleFailure);
    })
    .catch(handleFailure);
};

export const setPair = (dispatch, payload) => {
  return dispatch(setPairValues(payload));
};

const handleSubmarineSwapStatus = (data, source, dispatch, callback) => {
  const closeSource = () => {
    if (source) {
      source.close();
    }
  };

  const status = data.status;

  console.log('Received swap status: ' + status);

  switch (status) {
    case SwapUpdateEvent.TransactionMempool:
      dispatch(
        setSwapStatus({
          pending: true,
          message: 'Waiting for confirmation...',
        }),
      );
      break;

    case SwapUpdateEvent.InvoicePending:
    case SwapUpdateEvent.TransactionConfirmed:
      dispatch(
        setSwapStatus({
          pending: true,
          message: 'Waiting for invoice to be paid...',
        }),
      );
      break;

    case SwapUpdateEvent.ChannelCreated:
      dispatch(
        setChannelCreation({
          fundingTransactionId: data.channel.fundingTransactionId,
          fundingTransactionVout: data.channel.fundingTransactionVout,
        }),
      );
      dispatch(
        setSwapStatus({
          pending: true,
          message: 'Opening channel to you...',
        }),
      );
      break;

    case SwapUpdateEvent.InvoiceFailedToPay:
      closeSource();
      dispatch(
        setSwapStatus({
          error: true,
          pending: false,
          message: 'Could not pay invoice. Please refund your coins.',
        }),
      );
      break;

    case SwapUpdateEvent.SwapExpired:
      closeSource();
      dispatch(
        setSwapStatus({
          error: true,
          pending: false,
          message: 'Swap expired. Please refund your coins.',
        }),
      );
      break;

    case SwapUpdateEvent.InvoicePaid:
    case SwapUpdateEvent.InvoiceSettled:
    case SwapUpdateEvent.TransactionClaimed:
      localStorage.removeItem(LocalStorageState.ActiveSwap);

      closeSource();
      callback();
      break;

    default:
      console.log(`Unknown swap status: ${JSON.stringify(data)}`);
      break;
  }
};

export const createSwap = (
  dispatch,
  payload,
  callback,
  nextStep,
  handleSwapStatus = handleSubmarineSwapStatus,
) => {
  // In the frontend the second currency in the pair is the one we want to receive
  // Which means that if the frontend ask for the "BTC/LTC" pair, we have to send
  // a request with the pair "LTC/BTC" and the order side "buy" to the backend
  if (payload.pairId === 'BTC/LTC') {
    payload.pairId = 'LTC/BTC';
    payload.orderSide = 'buy';
  }

  dispatch(clearChannelCreation());

  dispatch(
    setSwapStatus({
      pending: true,
      message: 'Waiting for transaction...',
    }),
  );

  fetch(CREATE_SWAP, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(payload),
  }).then(async response => {
    let data = await response.json();
    dispatch(updateSwapDetails(data));

    if (response.status === 201) {
      startListening(
        dispatch,
        data.id,
        nextStep,
        handleSwapStatus,
        payload,
        data,
      );
      callback(data);
      return data;
    }

    alert('Error: ' + data.error);
  });
};

export const startListening = (
  dispatch,
  swapId,
  callback,
  handleSwapStatus,
  swapInfo,
  response,
) => {
  const source = new EventSource(`${STREAM_SWAP_STATUS}?id=${swapId}`);

  source.onerror = () => {
    source.close();
    const url = SWAP_STATUS_API;

    const interval = setInterval(() => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({ id: swapId }),
      }).then(statusReponse => {
        clearInterval(interval);

        startListening(dispatch, swapId, callback);

        statusReponse.json().then(data => {
          handleSwapStatus(
            data,
            source,
            dispatch,
            callback,
            swapInfo,
            response,
          );
        });
      });
    }, 1000);
  };

  source.onmessage = event => {
    handleSwapStatus(
      JSON.parse(event.data),
      source,
      dispatch,
      callback,
      swapInfo,
      response,
    );
  };
};

export const checkCurrentSwap = (
  swapDetails,
  dispatch,
  callback,
  handleSwapStatus = handleSubmarineSwapStatus,
) => {
  const url = SWAP_STATUS_API;
  const swapId = swapDetails.id;
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({ id: swapId }),
  }).then(statusReponse => {
    statusReponse.json().then(data => {
      console.log('Fetched latest swap status', data);
      if (
        [
          SwapUpdateEvent.TransactionClaimed,
          SwapUpdateEvent.InvoiceSettled,
          SwapUpdateEvent.TransactionMempool,
          SwapUpdateEvent.TransactionConfirmed,
        ].indexOf(data.status) !== -1
      ) {
        handleSwapStatus(
          data,
          null,
          dispatch,
          callback,
          {},
          { ...data, redeemScript: swapDetails.redeemScript },
        );
      } else {
        if (data.status === SwapUpdateEvent.MinerFeePaid) {
          dispatch(setEthereumPrepayMinerFeePaid(true));
        }

        startListening(
          dispatch,
          swapId,
          callback,
          handleSwapStatus,
          { pairId: swapDetails.pairId },
          { ...data, redeemScript: swapDetails.redeemScript },
        );
      }
    });
  });
};
