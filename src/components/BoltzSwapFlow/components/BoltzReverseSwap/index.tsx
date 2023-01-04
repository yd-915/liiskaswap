import { Signer } from 'ethers';
import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import { boltzPairsMap } from '../../../../constants/boltzRates';
import { BoltzSwapResponse, ClaimDetails, StatusResponse, SwapUpdateEvent } from '../../../../constants/boltzSwap';
import CurrencyID from '../../../../constants/currency';
import { useBoltzConfiguration } from '../../../../context/NetworkContext';
import { SwapFlowProps } from '../../../../pages/home';
import { removeRefundDetailsFromLocalStorage } from '../../../../utils/boltzRefund';
import { addReverseSwapDetailsToLocalStorage, claimSwap } from '../../../../utils/boltzReverseSwap';
import { startListening } from '../../../../utils/boltzSwapStatus';
import BoltzReverseDestination from './../../components/BoltzReverseDestination';
import BoltzReverseSend from './../../components/BoltzReverseSend';
import BoltzReverseSwapResult from './../../components/BoltzReverseSwapResult';

// TODO: fetch latest status on reload
const BoltzReverseSwap = (props: SwapFlowProps): ReactElement => {
  const { receiveAsset } = props;
  const [activeStep, setActiveStep] = useState(0);
  const [claimTransactionId, setClaimTransactionId] = useState('');
  const [swapDetails, setSwapDetails] = useState<BoltzSwapResponse | undefined>(
    undefined,
  );
  const [swapStatus, setSwapStatus] = useState<StatusResponse | undefined>(
    undefined,
  );
  const [claimDetails, setClaimDetails] = useState<ClaimDetails | undefined>(undefined);
  const [signer, setSigner] = useState<Signer | undefined>(undefined);
  const [error, setError] = useState('');
  const { apiEndpoint, bitcoinConstants, litecoinConstants } = useBoltzConfiguration();

  const network = useMemo(
    () =>
      boltzPairsMap(receiveAsset) === 'BTC'
        ? bitcoinConstants
        : litecoinConstants,
    [bitcoinConstants, litecoinConstants, receiveAsset],
  );

  const proceedToNext = useCallback(
    () => setActiveStep(oldValue => oldValue + 1),
    [setActiveStep],
  );

  const destinationComplete = useMemo(
    () =>
      (swapDetails: BoltzSwapResponse, claimDetails: ClaimDetails, signer?: Signer) => {
        addReverseSwapDetailsToLocalStorage({
          ...claimDetails,
          swapId: swapDetails.id,
          redeemScript: swapDetails.redeemScript!,
        });
        setSwapDetails(swapDetails);
        setClaimDetails(claimDetails);
        setSigner(signer);
        proceedToNext();
        startListening(swapDetails.id, apiEndpoint, (data, stream) => {
          setSwapStatus(data);

          // TODO: remove
          // @ts-ignore
          if (receiveAsset === CurrencyID.BTC || receiveAsset === CurrencyID.LTC) {
            if (
              (claimDetails.instantSwap
                && SwapUpdateEvent.TransactionMempool === data.status)
              || SwapUpdateEvent.TransactionConfirmed === data.status
            ) {
              // Ethereum Reverse Swap claims are triggered in the UI
              claimSwap(
                claimDetails,
                data,
                swapDetails,
                receiveAsset,
                network,
                apiEndpoint,
                transaction => setClaimTransactionId(transaction.getId()),
              ).subscribe({
                next: () => {},
                error: err => {
                  console.error(err);
                  stream.close();
                  setError('Failed to claim the funds.');
                  proceedToNext();
                },
                complete: () => {
                  stream.close();
                  proceedToNext();
                  removeRefundDetailsFromLocalStorage(swapDetails.id);
                },
              });
            } else {
              if (SwapUpdateEvent.TransactionClaimed) {
                stream.close();
                removeRefundDetailsFromLocalStorage(swapDetails.id);
              }
            }
          } else if (data.failureReason) {
            stream.close();
          }
        });
      },
    [proceedToNext, apiEndpoint, network, receiveAsset],
  );

  const sendCompleteEthereum = useMemo(() =>
    (claimTransactionId: string) => {
      setClaimTransactionId(claimTransactionId);
      proceedToNext();
    }, [proceedToNext]);

  const steps = [
    <BoltzReverseDestination {...props} proceedToNext={destinationComplete} />,
    <BoltzReverseSend
      {...props}
      swapDetails={swapDetails}
      claimDetails={claimDetails}
      swapStatus={swapStatus}
      signer={signer}
      proceedToNextEthereum={sendCompleteEthereum}
    />,
    <BoltzReverseSwapResult
      receiveAsset={props.receiveAsset}
      errorMessage={error || swapStatus?.failureReason}
      transactionId={claimTransactionId}
    />,
  ];

  return steps[activeStep];
};

export default BoltzReverseSwap;
