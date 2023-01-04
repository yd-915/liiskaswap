import { mergeMap, tap } from 'rxjs/operators';
import { address, ECPair, Network, Transaction } from 'bitcoinjs-lib';
import { constructClaimTransaction, detectSwap } from 'boltz-core';
import { Observable, of } from 'rxjs';
import { boltzPairsMap } from '../constants/boltzRates';
import {
  BoltzSwapResponse,
  ClaimDetails,
  FeeResponse,
  ReverseSwapDetails,
  StatusResponse,
} from '../constants/boltzSwap';
import CurrencyID from '../constants/currency';
import { broadcastRefund, getFeeEstimation, getHexBuffer } from './boltzRefund';

export const addReverseSwapDetailsToLocalStorage = (
  details: ReverseSwapDetails,
): void => {
  const boltzSwaps = getBoltzReverseSwapsFromLocalStorage();
  boltzSwaps.push(details);
  setBoltzReverseSwapsToLocalStorage(boltzSwaps);
};

export const getBoltzReverseSwapsFromLocalStorage = (): ReverseSwapDetails[] => {
  return JSON.parse(localStorage.getItem('boltzReverseSwaps') || '[]');
};

export const setBoltzReverseSwapsToLocalStorage = (
  swaps: ReverseSwapDetails[],
): void => {
  localStorage.setItem('boltzReverseSwaps', JSON.stringify(swaps));
};

export const claimSwap = (
  claimDetails: ClaimDetails,
  status: StatusResponse,
  swapResponse: BoltzSwapResponse,
  receiveCurrency: CurrencyID,
  network: Network,
  apiEndpoint: string,
  onClaimTransaction: (transaction: Transaction) => void,
): Observable<void> => {
  return getFeeEstimation(apiEndpoint).pipe(
    mergeMap(resp =>
      of(
        getClaimTransaction(
          boltzPairsMap(receiveCurrency),
          claimDetails,
          status,
          swapResponse,
          network,
          resp,
        ),
      )
    ),
    tap(onClaimTransaction),
    mergeMap(claimTransaction => broadcastRefund(receiveCurrency, claimTransaction.toHex(), apiEndpoint)),
  );
};

const getClaimTransaction = (
  onchainCurrency: string,
  claimDetails: ClaimDetails,
  statusResponse: StatusResponse,
  swapResponse: BoltzSwapResponse,
  network: Network,
  feeEstimation: FeeResponse,
): Transaction => {
  const redeemScript = getHexBuffer(swapResponse.redeemScript!);
  const lockupTransaction = Transaction.fromHex(
    statusResponse.transaction!.hex,
  );

  return constructClaimTransaction(
    [
      {
        ...detectSwap(redeemScript, lockupTransaction)!,
        redeemScript,
        txHash: lockupTransaction.getHash(),
        preimage: claimDetails.preImage,
        keys: ECPair.fromPrivateKey(getHexBuffer(claimDetails.privateKey!)),
      },
    ],
    address.toOutputScript(claimDetails.address, network),
    feeEstimation[onchainCurrency],
    false,
  );
};
