import { Button, Divider, FormControlLabel, Switch, TextareaAutosize, Typography } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DownloadRefundFile from '../../components/DownloadRefundFile';
import Popover from '../../components/Popover';
import QrCodeReader from '../../components/QrCodeReader';
import SelectComponent from '../../components/Select';
import { bitcoinNetwork, litecoinNetwork, LocalStorageState } from '../../constants/environment';
import { CurrencyTypes, fundTransferTypes, satConversionValue, SwapTypes } from '../../constants/submarine';
import { UtilsContext } from '../../context/UtilsContext';
import { isInvoiceValid } from '../../services/submarine/invoiceValidation';
import { generateKeys } from '../../services/submarine/keys';
import { createSwap, updateInvoice } from '../../services/submarine/submarineDuck';
import {
  selectOrderSide,
  selectPairId,
  selectReceiveCurrency,
  selectSendCurrency,
  selectSwapDetails,
} from '../../services/submarine/submarineSelectors';
import confirmAlert from '../../utils/confirmAlert';
import detectTorBrowser from '../../utils/detectTorBrowser';
import svgIcons from '../../utils/svgIcons';

const Destination = props => {
  const isTorBrowser = detectTorBrowser();

  const { handleNextStep, handlePrevStep } = props;
  const [invoice, setInvoice] = useState('');
  const [download, setDownload] = useState(isTorBrowser);
  const [downloadQR, setDownloadQR] = useState(false);
  const [browserScan, setBrowserScan] = useState(false);
  const [keys, setKeys] = useState({});

  const pairId = useSelector(selectPairId);
  const orderSide = useSelector(selectOrderSide);
  const swapDetails = useSelector(selectSwapDetails);
  const sendCurrency = useSelector(selectSendCurrency);
  const receiveCurrency = useSelector(selectReceiveCurrency);

  const dispatch = useDispatch();
  const utilsContext = useContext(UtilsContext);
  const isMobileView = !!utilsContext?.isMobileView;

  const [currencyOption, setCurrencyOption] = useState(
    fundTransferTypes[receiveCurrency.symbol][0],
  );

  const [invoiceAnchorEl, setInvoiceAnchorEl] = React.useState(null);
  const [refundFileAnchorEl, setRefundFileAnchorEl] = React.useState(null);
  const invoiceOpen = Boolean(invoiceAnchorEl);
  const refundFileOpen = Boolean(refundFileAnchorEl);

  useEffect(() => {
    if (window.webln) {
      (async () => {
        await window.webln.enable();
        const { paymentRequest } = await window.webln.makeInvoice({
          amount: Math.round(receiveCurrency.amount * satConversionValue),
        });

        onInvoiceChange({
          target: {
            value: paymentRequest,
          },
        });
      })();
    }
  }, [receiveCurrency]);

  useEffect(() => {
    if (
      receiveCurrency.type === CurrencyTypes.BitcoinLike
      || sendCurrency.type === CurrencyTypes.BitcoinLike
    ) {
      setKeys(
        generateKeys(
          receiveCurrency.symbol === 'BTC' ? bitcoinNetwork : litecoinNetwork,
        ),
      );
    }
  }, [sendCurrency, receiveCurrency]);

  useEffect(() => {
    if (invoice.slice(0, 10) === 'lightning:') {
      const trimmedInvoice = invoice.slice(10);
      dispatch(updateInvoice(trimmedInvoice));
      setInvoice(trimmedInvoice);
    } else {
      dispatch(updateInvoice(invoice));
    }
  }, [dispatch, invoice]);

  const handleInvoicePopoverOpen = event => {
    setInvoiceAnchorEl(event.currentTarget);
  };

  const handleInvoicePopoverClose = () => {
    setInvoiceAnchorEl(null);
  };

  const handleRefundFilePopoverOpen = event => {
    setRefundFileAnchorEl(event.currentTarget);
  };

  const handleRefundFilePopoverClose = () => {
    setRefundFileAnchorEl(null);
  };

  const onBrowserScanClick = () => {
    setBrowserScan(true);
  };

  const onInvoiceChange = e => {
    setInvoice(e.target.value.toLowerCase());
  };

  const onInvoiceScan = invoice => {
    setInvoice(invoice.toLowerCase());
  };

  const onDownloadChange = e => {
    // Force the user to download the refund file in the Tor browser
    if (!isTorBrowser) {
      setDownload(e.target.checked);
    }
  };

  const downloadHandler = () => {
    if (download) {
      setDownloadQR(true);
    }
  };

  const getReceivedAmountValue = () => {
    if (currencyOption.value === '1') {
      return Math.round(receiveCurrency.amount * satConversionValue);
    }

    return receiveCurrency.amount;
  };

  const addToLocalStorage = data => {
    // We only need this for Swaps on UTXO based, Bitcoin like, chains
    if (sendCurrency.type === CurrencyTypes.BitcoinLike) {
      const swapIds = JSON.parse(localStorage.getItem('swapIds') || '[]');
      const lastSwap = swapIds.pop();

      // TODO: we might also want to refactor this to make it easier to handle (but it would break compatibility (migration tool?))
      localStorage.setItem(
        'swapIds',
        JSON.stringify([
          ...(lastSwap ? [lastSwap] : []),
          {
            id: data.id,
            currency: sendCurrency.symbol,
            privateKey: keys.privateKey || '',
            redeemScript: data.redeemScript,
            timeoutBlockHeight: data.timeoutBlockHeight,
            date: new Date(),
          },
        ]),
      );
      localStorage.setItem(LocalStorageState.ActiveSwap, 'submarine');
    }
  };

  const prevStepHandler = () => {
    if (confirmAlert()) {
      handlePrevStep();
    }
  };

  const nextStepHandler = () => {
    let body = {
      pairId,
      invoice,
      orderSide,
      type: SwapTypes.Submarine,
      refundPublicKey: keys.publicKey || undefined,
      channel: {
        auto: true,
        private: false,
        inboundLiquidity: 25,
      },
    };

    createSwap(
      dispatch,
      body,
      data => {
        downloadHandler();
        addToLocalStorage(data);
        handleNextStep();
      },
      handleNextStep,
    );
  };

  const renderHeader = () => (
    <Typography
      variant='div'
      component='h2'
      align='center'
      className='submarine__destination_header'
    >
      Scan or paste a {receiveCurrency.label} invoice of
      <div className='funds-group'>
        {getReceivedAmountValue()}
        <SelectComponent
          options={fundTransferTypes[receiveCurrency.symbol]}
          variant='outlined'
          value={currencyOption}
          className={'funds-type-dropdown'}
          onChange={val => setCurrencyOption(val)}
        />
      </div>
    </Typography>
  );

  const getScanButton = () => (
    <Button color='primary' onClick={onBrowserScanClick}>
      <img src={svgIcons.camera} alt='' />
      Use browser to scan invoice
    </Button>
  );

  const renderInvoiceFields = () => (
    <div className='submarine__destination_invoice_group'>
      <div className='invoice-header'>
        <div>
          {receiveCurrency.symbol} invoice
          <img
            src={svgIcons.questionIcon}
            alt='question-icon'
            className='question-icon'
            onMouseEnter={handleInvoicePopoverOpen}
            onMouseLeave={handleInvoicePopoverClose}
          />
        </div>
        {
          /* <Button color="primary" onClick={onBrowserScanClick}>
                <img src={svgIcons.camera} alt="" />
                Use browser to scan invoice
            </Button>
             */
        }
        {!isMobileView && getScanButton()}
      </div>
      <TextareaAutosize
        className={'invoice-input'}
        rows={6}
        cols={77}
        placeholder='Paste the invoice'
        value={invoice}
        onChange={onInvoiceChange}
      />
      <QrCodeReader
        onClose={onInvoiceScan}
        open={browserScan}
        setOpen={setBrowserScan}
      />
      {!!invoice && !isInvoiceValid(invoice) && (
        <div className={'error-msg'}>Invalid invoice</div>
      )}
    </div>
  );

  return (
    <div className='submarine__destination'>
      {renderHeader()}
      {renderInvoiceFields()}
      <div className='submarine__destination_invoice_footer'>
        <Divider />
        {isMobileView && getScanButton()}
        <FormControlLabel
          onMouseEnter={handleRefundFilePopoverOpen}
          onMouseLeave={handleRefundFilePopoverClose}
          control={<Switch
            checked={download}
            onChange={onDownloadChange}
            color='primary'
            name='download'
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />}
          label={<div>
            Download refund file
            <img
              src={svgIcons.questionIcon}
              alt='question-icon'
              className='question-icon'
              onMouseEnter={handleRefundFilePopoverOpen}
              onMouseLeave={handleRefundFilePopoverClose}
            />
          </div>}
        />
        <div className='action-buttons'>
          <Button variant='outlined' onClick={prevStepHandler}>
            <img src={svgIcons.leftArrow} alt='' />
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={nextStepHandler}
            className='next-step-button'
            disabled={!invoice || !isInvoiceValid(invoice)}
          >
            Go to next step
          </Button>
        </div>
      </div>
      {downloadQR && (
        <DownloadRefundFile
          id={swapDetails.id}
          currency={receiveCurrency.symbol}
          privateKey={keys.privateKey || ''}
          redeemScript={swapDetails.redeemScript}
          timeoutBlockHeight={swapDetails.timeoutBlockHeight}
        />
      )}
      <Popover
        id='invoice-popover'
        open={invoiceOpen}
        anchorEl={invoiceAnchorEl}
        onCloseHandler={handleInvoicePopoverClose}
        text='A lightning invoice is how you receive payments on the lightning network. Please use a Lightning wallet to create an invoice.'
      />
      <Popover
        id='refund-file-popover'
        open={refundFileOpen}
        anchorEl={refundFileAnchorEl}
        onCloseHandler={handleRefundFilePopoverClose}
        text="The refund file is stored in your browser. Downloading it means you won't have a single point of failure for saved refund information, which is required for keeping the swap trustless."
      />
    </div>
  );
};

export default Destination;
