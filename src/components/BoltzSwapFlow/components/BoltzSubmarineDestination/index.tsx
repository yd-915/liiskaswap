import {
  createStyles,
  FormControlLabel,
  Grid,
  InputAdornment,
  makeStyles,
  Switch,
  TextField,
  Tooltip,
} from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { BOLTZ_CREATE_SWAP_API_URL } from '../../../../api/boltzApiUrls';
import useBoltzFetcher from '../../../../constants/boltzFetcherHook';
import { boltzPairsMap } from '../../../../constants/boltzRates';
import { BoltzSwapResponse, RefundDetails } from '../../../../constants/boltzSwap';
import CurrencyID from '../../../../constants/currency';
import { useBoltzConfiguration } from '../../../../context/NetworkContext';
import { UtilsContext } from '../../../../context/UtilsContext';
import { SwapFlowProps } from '../../../../pages/home';
import { isInvoiceValid } from '../../../../services/submarine/invoiceValidation';
import { generateKeys } from '../../../../services/submarine/keys';
import { selectUnit } from '../../../../store/boltz-slice';
import { useAppSelector } from '../../../../store/hooks';
import { addRefundDetailsToLocalStorage } from '../../../../utils/boltzRefund';
import { decodeInvoice } from '../../../../utils/invoiceDecoder';
import svgIcons from '../../../../utils/svgIcons';
import Button from '../../../Button';
import DownloadRefundFile from '../../../DownloadRefundFile';
import QrCodeReader from '../../../QrCodeReader';
import BoltzAmount from '../BoltzAmount';
import BoltzSwapStep from '../BoltzSwapStep';

type BoltzSubmarineDestinationProps = SwapFlowProps & {
  proceedToNext: (preimageHash: string, swapDetails: BoltzSwapResponse) => void;
};

const useStyles = makeStyles(() =>
  createStyles({
    input: {
      borderRadius: 0,
      alignItems: 'start',
    },
    scanButton: {
      marginBottom: '1rem',
    },
    hintIcon: {
      height: '1.5rem',
    },
    endAdornment: {
      display: 'block',
    },
    downloadRefund: {
      marginTop: '1rem',
      '& .MuiFormControlLabel-label': {
        display: 'flex',
        alignItems: 'center',
      },
    },
    downloadRefundHint: {
      height: '1.25rem',
      marginLeft: '0.5rem',
    },
  })
);

const BoltzSubmarineDestination = (
  props: BoltzSubmarineDestinationProps,
): ReactElement => {
  const { proceedToNext, receiveAmount, sendAsset, receiveAsset } = props;
  const classes = useStyles();
  const units = useAppSelector(selectUnit);
  const [invoice, setInvoice] = useState('');
  const [error, setError] = useState('');
  const [downloadRefundFile, setDownloadRefundFile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [browserScan, setBrowserScan] = useState(false);
  const boltzRates = useBoltzFetcher();
  const { apiEndpoint, bitcoinConstants, litecoinConstants } = useBoltzConfiguration();
  const [keys, setKeys] = useState<{ publicKey?: string; privateKey?: string }>(
    {},
  );
  const [refundDetails, setRefundDetails] = useState<RefundDetails | undefined>(
    undefined,
  );
  const [displayedAmount, setDisplayedAmount] = useState('');
  const utilsContext = useContext(UtilsContext);
  const isMobileView = !!utilsContext?.isMobileView;

  const invoiceFieldText = `Invoice for ${displayedAmount} ${units[boltzPairsMap(receiveAsset)].id}`;

  const invoiceValid = (invoice: string) => !invoice || isInvoiceValid(invoice);

  const nextEnabled = !!invoice && isInvoiceValid(invoice);

  useEffect(() => {
    const network = boltzPairsMap(receiveAsset) === 'BTC'
      ? bitcoinConstants
      : litecoinConstants;
    setKeys(generateKeys(network));
  }, [sendAsset, receiveAsset, bitcoinConstants, litecoinConstants]);

  const createSwap = async () => {
    const formattedPairs = await boltzRates!.formatPair([
      sendAsset,
      receiveAsset,
    ]);

    const params = {
      ...formattedPairs,
      type: 'submarine',
      invoice: invoice,
      // TODO: no refund public key needed for Ethereum
      refundPublicKey: keys.publicKey,
      channel: {
        auto: true,
        private: false,
        inboundLiquidity: 25,
      },
    };

    const errorMessage = 'Something went wrong. Please try again.';
    setLoading(true);

    try {
      const response = await fetch(BOLTZ_CREATE_SWAP_API_URL(apiEndpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(params),
      });

      const data: BoltzSwapResponse = await response.json();

      if (response.status === 201) {
        setError('');
        const refundData: RefundDetails = {
          swapId: data.id,
          currency: sendAsset,
          timeoutBlockHeight: data.timeoutBlockHeight,
          redeemScript: data.redeemScript!,
          privateKey: keys.privateKey!,
          date: new Date(),
        };
        setRefundDetails(refundData);
        addRefundDetailsToLocalStorage(refundData);
        proceedToNext(decodeInvoice(invoice).paymentHash!, data);

        return;
      } else {
        const message = data.error || errorMessage;
        setError(message);
        setLoading(false);
      }
      // TODO: show actual error
    } catch (_) {
      setError(errorMessage);
      setLoading(false);
    }
  };

  const refundDownloadAvailable = ![
    CurrencyID.ETH,
    CurrencyID.ETH_USDT,
  ].includes(sendAsset);

  return (
    <BoltzSwapStep
      title={<>
        Paste invoice to receive
        <br />
        <BoltzAmount
          amountInMainUnit={receiveAmount}
          currency={receiveAsset}
          onDisplayedAmountChange={setDisplayedAmount}
        />
      </>}
      content={<Grid item container justify='center'>
        {isMobileView && (
          <Button
            onClick={() => setBrowserScan(true)}
            startIcon={<img src={svgIcons.camera} alt='scan' />}
            className={classes.scanButton}
          >
            Scan invoice
          </Button>
        )}
        <TextField
          multiline
          fullWidth
          variant='outlined'
          aria-label={invoiceFieldText}
          rows={6}
          placeholder={invoiceFieldText}
          value={invoice}
          onChange={e => {
            setInvoice(e.target.value);
            setError('');
          }}
          error={!invoiceValid(invoice)}
          helperText={!invoiceValid(invoice) && 'Invalid invoice'}
          InputProps={{
            className: classes.input,
            endAdornment: (
              <InputAdornment position='end' className={classes.endAdornment}>
                <Tooltip
                  title='A lightning invoice is how you receive payments on the lightning network. Please use a Lightning wallet to create an invoice.'
                >
                  <img
                    className={classes.hintIcon}
                    src={svgIcons.questionIcon}
                    alt='hint'
                  />
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
        {refundDownloadAvailable && (
          <FormControlLabel
            control={<Switch
              checked={downloadRefundFile}
              onChange={() => setDownloadRefundFile(oldValue => !oldValue)}
              name='downloadRefundFile'
              color='primary'
            />}
            className={classes.downloadRefund}
            label={<>
              Download refund file
              <Tooltip
                title='The refund details are stored in your browser. You can also save the file on your device.'
              >
                <img
                  className={classes.downloadRefundHint}
                  src={svgIcons.questionIcon}
                  alt='hint'
                />
              </Tooltip>
            </>}
          />
        )}
        {refundDownloadAvailable && downloadRefundFile && !!refundDetails && (
          <DownloadRefundFile details={refundDetails} />
        )}
        <QrCodeReader
          onClose={(invoice: string) => setInvoice(invoice.toLowerCase())}
          open={browserScan}
          setOpen={setBrowserScan}
        />
      </Grid>}
      errorMessage={error}
      mainButtonText='Next'
      mainButtonVisible
      onMainButtonClick={createSwap}
      mainButtonDisabled={!nextEnabled}
      mainButtonLoading={loading}
    />
  );
};

export default BoltzSubmarineDestination;
