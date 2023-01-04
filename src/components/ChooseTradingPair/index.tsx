import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import React, { useState } from 'react';
import { useHistory } from 'react-router';
import useBoltzFetcher from '../../constants/boltzFetcherHook';
import Currency, { CurrencyOption, CurrencyOptions } from '../../constants/currency';
import { AmountPreview, RatesFetcher } from '../../constants/rates';
import { SwapProvider } from '../../constants/swap';
import { buildUrl, ROUTES } from '../../pages/home';
import { getSwapProvider } from '../../utils/swapProvider';
import useComitFetcher from '../ComitSwapFlow/useComitFetcher';
import useTdexFetcher from '../TdexSwapFlow/utils/tdexFetcherHook';
import AssetSelector from '../AssetSelector';
import BoltzRefundLink from '../BoltzRefundLink';
import Button from '../Button';
import CardComponent from '../Card';
import ErrorMessage from '../ErrorMessage';
import SwapButton from '../SwapButton';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
      'flex-direction': 'column',
      'justify-content': 'space-between',
      flex: 1,
    },
    content: {
      padding: '2rem',
    },
    text: {
      marginBottom: '1rem',
      fontSize: '1.5rem',
      lineHeight: 'normal',
      letterSpacing: '1px',
    },
    amount: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '1rem',
    },
    right: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    amountscontainer: {
      marginTop: '1rem',
    },
    errorMessageContainer: {
      minHeight: '1.5rem',
      marginTop: '1rem',
    },
  })
);

export type ChooseTradingPairProps = {};

const ChooseTradingPair = (_props: ChooseTradingPairProps) => {
  const classes = useStyles();

  const [sendAsset, setSendAsset] = useState(Currency.BTC);
  const [receiveAsset, setReceiveAsset] = useState(Currency.LIGHTNING_BTC);
  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [sendAmountError, setSendAmountError] = useState('');
  const [receiveAmountError, setReceiveAmountError] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);

  const history = useHistory();

  const swapProvider = getSwapProvider(sendAsset, receiveAsset);

  // TODO: Should be handled in a reducer
  const [previewValueError, setPreviewValueError] = useState<Error | null>(
    null,
  );

  const sendCurrency = CurrencyOptions.find(
    currency => currency.id === sendAsset,
  )!;
  const receiveCurrency = CurrencyOptions.find(
    currency => currency.id === receiveAsset,
  )!;

  const nextDisabled = isPreviewing
    || Number(sendAmount) === 0
    || Number(receiveAmount) === 0
    || !swapProvider
    || !!receiveAmountError;

  const tdexFetcher = useTdexFetcher();
  const boltzFetcher = useBoltzFetcher();
  const comitFetcher = useComitFetcher();

  let ratesFetcher: RatesFetcher | null;
  switch (swapProvider) {
    case SwapProvider.TDEX:
      ratesFetcher = tdexFetcher;
      break;
    case SwapProvider.COMIT:
      ratesFetcher = comitFetcher;
      break;
    case SwapProvider.BOLTZ:
      ratesFetcher = boltzFetcher;
      break;
    default:
      break;
  }

  const amountIsPositive = (x: any): boolean => {
    if (!Number.isNaN(x) && Number(x) > 0) {
      return true;
    }

    return false;
  };

  const onSendAmountChange = async (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setSendAmountError('');
    if (isPreviewing) return;

    const value = e.target.value;
    setSendAmount(value);

    // preview other amount
    if (ratesFetcher && amountIsPositive(value)) {
      setIsPreviewing(true);

      const amount = new BigNumber(value);

      try {
        setPreviewValueError(null);
        const receiveValue: AmountPreview = await ratesFetcher.previewGivenSend(
          {
            amount,
            currency: sendCurrency.id,
          },
          [sendCurrency.id, receiveCurrency.id],
        );

        setReceiveAmount(
          convertAmountToString(receiveValue.amountWithFees.amount),
        );
        await validateReceiveLimits(receiveValue.amountWithFees.amount);
        setIsPreviewing(false);
      } catch (e) {
        if (!previewValueError) {
          setPreviewValueError(e);
        }
      }
    }
  };

  const onReceiveAmountChange = async (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setReceiveAmountError('');
    if (isPreviewing) return;

    const value = e.target.value;
    setReceiveAmount(value);

    // preview other amount
    if (ratesFetcher && amountIsPositive(value)) {
      setIsPreviewing(true);

      const amount = new BigNumber(value);
      try {
        validateReceiveLimits(amount);

        setPreviewValueError(null);
        const sendValue: AmountPreview = await ratesFetcher.previewGivenReceive(
          {
            amount,
            currency: receiveCurrency.id,
          },
          [sendCurrency.id, receiveCurrency.id],
        );

        setSendAmount(convertAmountToString(sendValue.amountWithFees.amount));
        setIsPreviewing(false);
      } catch (e) {
        if (!previewValueError) {
          setPreviewValueError(e);
        }
      }
    }
  };

  const validateReceiveLimits = async (receiveAmount: BigNumber) => {
    if (ratesFetcher?.getLimits) {
      const limits = await ratesFetcher.getLimits([
        sendCurrency.id,
        receiveCurrency.id,
      ]);
      if (receiveAmount.gt(limits.maximal)) {
        setReceiveAmountError(
          `Max amount is ${convertAmountToString(limits.maximal)}`,
        );
      } else if (receiveAmount.lt(limits.minimal)) {
        setReceiveAmountError(
          `Min amount is ${convertAmountToString(limits.minimal)}`,
        );
      }
    }
  };

  const convertAmountToString = (amount: BigNumber): string =>
    amount.toNumber().toLocaleString('en-US', {
      maximumFractionDigits: 8,
    });

  const renderCryptoOptions = () => {
    return (
      <Grid container justify='center' direction='row' alignItems='center'>
        <Grid item xs={12}>
          <AssetSelector
            label={'You send'}
            value={sendAmount}
            placeholder={'0.00'}
            onAmountChange={onSendAmountChange}
            onAssetChange={(currency: CurrencyOption) => setSendAsset(currency.id)}
            selectedAsset={sendCurrency}
            error={sendAmountError}
          />
        </Grid>
        <Grid item xs={12}>
          <SwapButton
            onClick={() => {
              setSendAsset(receiveCurrency.id);
              setReceiveAsset(sendCurrency.id);
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <AssetSelector
            label={'You receive'}
            value={receiveAmount}
            placeholder={'0.00'}
            onAmountChange={onReceiveAmountChange}
            onAssetChange={(currency: CurrencyOption) => setReceiveAsset(currency.id)}
            selectedAsset={receiveCurrency}
            error={receiveAmountError}
          />
        </Grid>
      </Grid>
    );
  };

  return (
    <>
      <CardComponent>
        <div className={classes.root}>
          <Grid container justify='flex-start' className={classes.content}>
            <Typography className={classes.text} component='h2' align='left'>
              Swap
            </Typography>
            {renderCryptoOptions()}
            <Grid
              item
              container
              justify='center'
              className={classes.errorMessageContainer}
            >
              {!swapProvider && (
                <ErrorMessage message='Trading pair not supported' />
              )}
              {previewValueError
                ? (
                  <ErrorMessage message={previewValueError.message} />
                )
                : (
                  <></>
                )}
            </Grid>
          </Grid>
          <Button
            fullWidth
            variant='contained'
            color='primary'
            disabled={nextDisabled}
            onClick={() => {
              let params = new URLSearchParams();
              params.append('sendAmount', sendAmount);
              params.append('receiveAmount', receiveAmount);

              history.push(buildUrl(ROUTES.NEW_SWAP, {
                swapProvider,
                sendAsset,
                receiveAsset,
              }, params));
            }}
          >
            Next
          </Button>
        </div>
      </CardComponent>
      {swapProvider === SwapProvider.BOLTZ
        && <BoltzRefundLink />}
    </>
  );
};

export default ChooseTradingPair;
