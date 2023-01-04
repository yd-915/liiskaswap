import { mergeMap } from 'rxjs/operators';
import { ContractABIs } from 'boltz-core';
import { constants, Contract, Signer } from 'ethers';
import React, { ReactElement, useEffect, useState } from 'react';
import { forkJoin, from } from 'rxjs';
import { boltzPairsMap } from '../../../../constants/boltzRates';
import { BoltzSwapResponse, StatusResponse, SwapUpdateEvent } from '../../../../constants/boltzSwap';
import CurrencyID from '../../../../constants/currency';
import { selectEthereumData } from '../../../../store/boltz-slice';
import { useAppSelector } from '../../../../store/hooks';
import { sendEthereumTransaction } from '../../../../utils/ethereumTransactionWrapper';
import { formatTokenAmount } from '../../../../utils/tokenDecimalHelper';
import Button from '../../../Button';
import BoltzEthereumAccount from '../BoltzEthereumAccount';
import BoltzSwapStep from '../BoltzSwapStep';

// TODO: no refund files for ethereum swaps

// TODO: (plus disconnect / connect other provider)
const BoltzSubmarineSendEthereum = (props: {
  swapStatus?: StatusResponse;
  swapDetails: BoltzSwapResponse;
  preimageHash: string;
  title: ReactElement;
  sendCurrency: CurrencyID;
  proceedToNext: () => void;
}): ReactElement => {
  const { title, proceedToNext, swapStatus, sendCurrency } = props;

  const ethereumData = useAppSelector(selectEthereumData);

  const [loading, setLoading] = useState(false);
  const [wrongChain, setWrongChain] = useState(false);

  const [signer, setSigner] = useState<Signer | undefined>(undefined);

  const [error, setError] = useState('');
  const [notEnoughTokens, setNotEnoughTokens] = useState(false);

  const [tokenContract, setTokenContract] = useState<Contract | undefined>(
    undefined,
  );
  const [needsApproval, setNeedsApproval] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);

  // 18 by default because Ether has 18
  const [tokenDecimals, setTokenDecimals] = useState(18);

  useEffect(() => {
    if (sendCurrency === CurrencyID.ETH) {
      return;
    }

    // TODO: fetch ethereumData at some earlier point in time
    if (ethereumData === undefined || signer === undefined) {
      return;
    }

    // TODO: indicate that stuff is loading in here
    const tokenContract = new Contract(
      ethereumData.tokens[boltzPairsMap(sendCurrency)],
      ContractABIs.ERC20,
    ).connect(signer!);
    setTokenContract(tokenContract);

    const signerAddress$ = from(signer!.getAddress());
    const erc20SwapAddress = ethereumData.swapContracts.ERC20Swap;

    // TODO: for may: check balance every 15 seconds or so?
    const sub = signerAddress$
      .pipe(
        mergeMap(signerAddress =>
          forkJoin([
            from(tokenContract.decimals()),
            from(tokenContract.allowance(signerAddress, erc20SwapAddress)),
            from(tokenContract.balanceOf(signerAddress)),
          ])
        ),
      )
      .subscribe({
        next: ([decimals, allowance, balance]) => {
          setTokenDecimals(decimals as number);

          const formattedTokenAmount = formatTokenAmount(
            decimals as number,
            props.swapDetails.expectedAmount!,
          );

          if ((balance as any).lt(formattedTokenAmount)) {
            // TODO: show what we are missing
            setNotEnoughTokens(true);
            setError(`Not enough ${sendCurrency} tokens in Ethereum wallet`);
          }

          if ((allowance as any).lte(formattedTokenAmount)) {
            setNeedsApproval(true);
          }
        },
        error: err => {},
      });

    return () => sub?.unsubscribe();
  }, [sendCurrency, ethereumData, signer, props]);

  useEffect(() => {
    if (
      swapStatus
      && swapStatus.status === SwapUpdateEvent.TransactionConfirmed
    ) {
      proceedToNext();
    }
  }, [swapStatus, proceedToNext]);

  return (
    <BoltzSwapStep
      title={title}
      content={<>
        <BoltzEthereumAccount
          setWrongChain={setWrongChain}
          setError={setError}
          setSigner={setSigner}
          additionalButton={signer && sendCurrency !== CurrencyID.ETH
            ? (
              <Button
                variant='contained'
                color='primary'
                disabled={!needsApproval || !!error || waitingForApproval}
                loading={waitingForApproval}
                onClick={() => {
                  setWaitingForApproval(true);
                  tokenContract!
                    .approve(
                      ethereumData.swapContracts.ERC20Swap,
                      constants.MaxUint256,
                    )
                    .then(() => {
                      setWaitingForApproval(false);
                      setNeedsApproval(false);
                    })
                    .catch(() => setWaitingForApproval(false));
                }}
              >
                Approve
              </Button>
            )
            : undefined}
        />
      </>}
      errorMessage={error}
      mainButtonVisible
      mainButtonText='Send'
      mainButtonDisabled={needsApproval || notEnoughTokens || !signer || wrongChain}
      mainButtonLoading={loading}
      onMainButtonClick={async () => {
        setError('');
        setLoading(true);
        try {
          if (sendCurrency === CurrencyID.ETH) {
            const etherSwap = new Contract(
              ethereumData.swapContracts.EtherSwap,
              ContractABIs.EtherSwap,
            ).connect(signer!);

            await sendEthereumTransaction(
              signer!,
              await etherSwap.populateTransaction.lock(
                `0x${props.preimageHash}`,
                props.swapDetails.claimAddress,
                props.swapDetails.timeoutBlockHeight,
                {
                  value: formatTokenAmount(
                    tokenDecimals,
                    props.swapDetails.expectedAmount!,
                  ),
                },
              ),
            );
          } else {
            const erc20Swap = new Contract(
              ethereumData.swapContracts.ERC20Swap,
              ContractABIs.ERC20Swap,
            ).connect(signer!);

            await sendEthereumTransaction(
              signer!,
              await erc20Swap.populateTransaction.lock(
                `0x${props.preimageHash}`,
                formatTokenAmount(
                  tokenDecimals,
                  props.swapDetails.expectedAmount!,
                ),
                tokenContract!.address,
                props.swapDetails.claimAddress,
                props.swapDetails.timeoutBlockHeight,
              ),
            );
          }
        } catch (error) {
          setLoading(false);
          if (typeof error === 'string') {
            setError(error);
          } else {
            setError('Could not send Ethereum transaction');
          }
        }
      }}
    />
  );
};

export default BoltzSubmarineSendEthereum;
