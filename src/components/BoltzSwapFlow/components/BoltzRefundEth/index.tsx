import { createStyles, Grid, List, ListItem, ListItemText, makeStyles, Typography } from '@material-ui/core';
import { BigNumber, Contract, Signer } from 'ethers';
import React, { ReactElement, useEffect, useState } from 'react';
import blockTimes from '../../../../constants/blockTimes';
import { selectEthereumData } from '../../../../store/boltz-slice';
import { useAppSelector } from '../../../../store/hooks';
import { sendEthereumTransaction } from '../../../../utils/ethereumTransactionWrapper';
import { queryEthereumSwaps } from '../../../../views/refund/ethereumFetcher';
import BoltzEthereumAccount from '../BoltzEthereumAccount';
import BoltzSwapStep from '../BoltzSwapStep';

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      display: 'flex',
      'flex-direction': 'column',
      'justify-content': 'space-between',
      flex: 1,
      minHeight: 440,
    },
    list: {
      maxHeight: '10rem',
      width: '100%',
      overflowY: 'auto',
      margin: '1rem 0',
    },
  })
);

type EthereumRefundDetails = {
  preimageHash: string;
  claimAddress: string;
  refundAddress: string;
  amount: BigNumber;
  timelock: BigNumber;

  // Only set for ERC20 swaps
  tokenAddress?: string;
};

type RefundableEthSwap = {
  id: string;
  type: 'ERC20' | 'Ether'; // TODO: convert to enum
  contract: Contract;
  date: Date;
  data: EthereumRefundDetails;
};

const BoltzRefundEth = (): ReactElement => {
  const classes = useStyles();

  const [signer, setSigner] = useState<Signer | undefined>(undefined);
  const [error, setError] = useState('');
  const [wrongChain, setWrongChain] = useState(false);
  const ethereumData = useAppSelector(selectEthereumData);
  const [refundableEthSwaps, setRefundableEthSwaps] = useState<
    RefundableEthSwap[]
  >([]);

  const [selectedSwap, setSelectedSwap] = useState<
    RefundableEthSwap | undefined
  >(undefined);
  const [timeoutDelta, setTimeoutDelta] = useState<number | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!signer || error) return;
    setRefundableEthSwaps([]);
    const contracts = {
      ethereum: {
        swapContracts: ethereumData.swapContracts,
      },
    };
    const abortQueryingEthereumSwaps = queryEthereumSwaps(
      signer,
      contracts,
      (refundableSwap: RefundableEthSwap) => {
        setRefundableEthSwaps(existingSwaps => existingSwaps.concat(refundableSwap));
      },
    );

    return () => {
      if (abortQueryingEthereumSwaps) {
        abortQueryingEthereumSwaps();
      }
    };
  }, [signer, error, ethereumData]);

  useEffect(() => {
    if (!signer || !selectedSwap) return;
    setLoading(true);
    (async () => {
      try {
        const blockNumber = await signer.provider!.getBlockNumber();
        const timelock = selectedSwap.data.timelock.toNumber();
        if (timelock > blockNumber) {
          const timeoutDeltaHours = ((timelock - blockNumber) * blockTimes.Ethereum) / 3600;
          setTimeoutDelta(parseFloat(timeoutDeltaHours.toFixed(2)));
        } else {
          setTimeoutDelta(-1);
        }
      } catch (e) {
        setError(JSON.stringify(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedSwap, setTimeoutDelta, signer]);

  const refundEthereumSwap = async () => {
    if (!selectedSwap || !signer) return;
    setLoading(true);
    try {
      setError('');
      if (selectedSwap.type === 'Ether') {
        const tx = await sendEthereumTransaction(
          signer,
          await selectedSwap.contract.populateTransaction.refund(
            selectedSwap.data.preimageHash,
            selectedSwap.data.amount,
            selectedSwap.data.claimAddress,
            selectedSwap.data.timelock,
          ),
        );
        await tx.wait();
      } else {
        const tx = await sendEthereumTransaction(
          signer,
          await selectedSwap.contract.populateTransaction.refund(
            selectedSwap.data.preimageHash,
            selectedSwap.data.amount,
            selectedSwap.data.tokenAddress,
            selectedSwap.data.claimAddress,
            selectedSwap.data.timelock,
          ),
        );
        await tx.wait();
      }
      setRefundableEthSwaps(existingSwaps => existingSwaps.filter(swap => swap.id !== selectedSwap.id));
      setSelectedSwap(undefined);
      setTimeoutDelta(undefined);
    } catch (e) {
      setError(JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  const mainButtonText = timeoutDelta
    ? timeoutDelta <= -1
      ? 'Refund'
      : `Refundable in ~${timeoutDelta} hours`
    : 'Select swap to refund';

  const mainButtonDisabled = !wrongChain && timeoutDelta && timeoutDelta <= -1 ? false : true;

  const content = (
    <>
      <Grid container direction='column' wrap='nowrap' alignItems='center'>
        <BoltzEthereumAccount
          setError={setError}
          setSigner={setSigner}
          setWrongChain={setWrongChain}
        />
        <List className={classes.list}>
          {Object.values(refundableEthSwaps).map(swap => (
            <ListItem
              key={swap.id}
              button
              selected={selectedSwap?.id === swap.id}
              onClick={() => {
                setSelectedSwap(swap);
              }}
            >
              <ListItemText>
                <Grid
                  item
                  container
                  justify='space-between'
                  alignItems='center'
                >
                  <Grid item xs={12} sm={5}>
                    <Typography variant='body2'>ID: {swap.id}</Typography>
                  </Grid>
                  <Typography variant='caption'>
                    {new Date(swap.date).toLocaleString()}
                  </Typography>
                </Grid>
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </Grid>
      <div></div>
    </>
  );
  return (
    <BoltzSwapStep
      title='Check status or refund'
      content={content}
      mainButtonVisible
      mainButtonDisabled={mainButtonDisabled}
      mainButtonLoading={loading}
      mainButtonText={mainButtonText}
      errorMessage={error}
      onMainButtonClick={refundEthereumSwap}
    />
  );
};

export default BoltzRefundEth;
