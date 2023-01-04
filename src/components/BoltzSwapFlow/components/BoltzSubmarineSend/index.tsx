import { createStyles, Grid, InputAdornment, makeStyles, TextField } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import React, { ReactElement, useEffect } from 'react';
import { BoltzSwapResponse, StatusResponse, SwapUpdateEvent } from '../../../../constants/boltzSwap';
import CurrencyID from '../../../../constants/currency';
import { swapError } from '../../../../utils/boltzSwapStatus';
import Button from '../../../Button';
import DrawQrCode from '../../../DrawQrCode';
import BoltzAmount from '../BoltzAmount';
import BoltzSwapStep from '../BoltzSwapStep';
import BoltzSubmarineSendEthereum from './BoltzSubmarineSendEthereum';

type BoltzSubmarineSendProps = {
  swapDetails: BoltzSwapResponse;
  swapStatus?: StatusResponse;
  preimageHash: string;
  sendAsset: CurrencyID;
  proceedToNext: () => void;
};

const useStyles = makeStyles(() =>
  createStyles({
    qrCodeContainer: {
      marginTop: '1rem',
    },
    input: {
      borderRadius: 0,
    },
  })
);

const BoltzSubmarineSend = (props: BoltzSubmarineSendProps): ReactElement => {
  const classes = useStyles();
  const { swapDetails, swapStatus, sendAsset, proceedToNext } = props;

  const isWaitingForTransaction = !swapStatus || swapStatus.status === SwapUpdateEvent.InvoiceSet;

  useEffect(() => {
    if (swapStatus && swapError(swapStatus)) {
      proceedToNext();
    }
  }, [swapStatus, proceedToNext]);

  const title = (
    <>
      Send
      <br />
      <BoltzAmount
        amountInMainUnit={new BigNumber(swapDetails.expectedAmount!)
          .dividedBy(10 ** 8)
          .toString()}
        currency={sendAsset}
      />
    </>
  );

  return sendAsset === CurrencyID.BTC || sendAsset === CurrencyID.LTC
    ? (
      <BoltzSwapStep
        title={title}
        content={<>
          <TextField
            fullWidth
            variant='outlined'
            multiline
            disabled
            value={swapDetails.address}
            InputProps={{
              className: classes.input,
              endAdornment: (
                <InputAdornment position='end'>
                  <Button
                    onClick={() => navigator.clipboard?.writeText(swapDetails.address)}
                  >
                    Copy
                  </Button>
                </InputAdornment>
              ),
            }}
          />
          <Grid
            item
            container
            justify='center'
            className={classes.qrCodeContainer}
          >
            <DrawQrCode size={150} link={swapDetails.bip21!} />
          </Grid>
        </>}
        mainButtonVisible
        mainButtonText={isWaitingForTransaction ? 'Waiting for transaction' : 'Next'}
        mainButtonDisabled={isWaitingForTransaction}
        onMainButtonClick={proceedToNext}
      />
    )
    : (
      <BoltzSubmarineSendEthereum
        sendCurrency={sendAsset}
        title={title}
        swapDetails={swapDetails}
        preimageHash={props.preimageHash}
        proceedToNext={proceedToNext}
        swapStatus={swapStatus}
      />
    );
};

export default BoltzSubmarineSend;
