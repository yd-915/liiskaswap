import { boltzApi } from '../constants/environment';

export const GET_PAIRS = `${boltzApi}/getpairs`;
export const GET_CONTRACTS = `${boltzApi}/getcontracts`;
export const CREATE_SWAP = `${boltzApi}/createSwap`;
export const STREAM_SWAP_STATUS = `${boltzApi}/streamswapstatus`;
export const SWAP_STATUS = `${boltzApi}/swapstatus`;
export const GET_SWAP_TRANSACTION = `${boltzApi}/getswaptransaction`;
export const GET_FEE_ESTIMATION = `${boltzApi}/getfeeestimation`;
export const BROADCAST_TRANSACTION = `${boltzApi}/broadcasttransaction`;
