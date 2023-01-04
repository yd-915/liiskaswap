import { Button, Divider, FormControlLabel, Switch, TextareaAutosize, Typography } from '@material-ui/core';
import { crypto } from 'bitcoinjs-lib';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import EthereumAccount from '../../components/EthereumAccount';
import Popover from '../../components/Popover';
import { bitcoinNetwork, litecoinNetwork, LocalStorageState } from '../../constants/environment';
import { CurrencyTypes, isEthereumCurrencyType, satConversionValue, SwapTypes } from '../../constants/submarine';
import { selectSigner } from '../../services/ethereum/ethereumSelectors';
import { isAddressValid } from '../../services/reverse/addressValidation';
import { createReverseSwap } from '../../services/reverse/reverseDuck';
import { selectEthereumPrepayMinerFee } from '../../services/reverse/reverseSelectors';
import { generateKeys, getHexString } from '../../services/submarine/keys';
import { randomBytes } from '../../services/submarine/randomBytes';
import {
  selectOrderSide,
  selectPairId,
  selectReceiveCurrency,
  selectSendCurrency,
} from '../../services/submarine/submarineSelectors';
import svgIcons from '../../utils/svgIcons';

const Destination = props => {
  const { handleNextStep } = props;

  const history = useHistory();
  const dispatch = useDispatch();

  const [keys, setKeys] = useState({});
  const [address, setAddress] = useState('');
  const [account, setAccount] = useState('');
  const [instantSwap, setInstantSwap] = useState(true);
  const [instantSwapAnchorEl, setInstantSwapAnchorEl] = useState(null);

  const signer = useSelector(selectSigner);
  const pairId = useSelector(selectPairId);
  const orderSide = useSelector(selectOrderSide);
  const sendCurrency = useSelector(selectSendCurrency);
  const receiveCurrency = useSelector(selectReceiveCurrency);
  const ethereumPrepayMinerFee = useSelector(selectEthereumPrepayMinerFee);

  const instantSwapOpen = Boolean(instantSwapAnchorEl);
  const sendAmount = Math.round(
    parseFloat(sendCurrency.amount) * satConversionValue,
  );

  const isEthereum = isEthereumCurrencyType(receiveCurrency.type);
  const currencyNetwork = receiveCurrency.symbol === 'BTC' ? bitcoinNetwork : litecoinNetwork;

  const handleInstantSwapPopoverOpen = event => {
    setInstantSwapAnchorEl(event.currentTarget);
  };

  const handleInstantSwapPopoverClose = () => {
    setInstantSwapAnchorEl(null);
  };

  useEffect(() => {
    if (!sendAmount) {
      handlePrevStep();
    }
  });

  useEffect(() => {
    setKeys(generateKeys(currencyNetwork));
  }, [currencyNetwork]);

  useEffect(() => {
    const getAccount = async () => {
      setAccount(await signer.getAddress());
    };

    if (isEthereum && signer) {
      getAccount();
    }
  }, [signer, receiveCurrency, isEthereum, account, setAccount]);

  const onAddressChange = e => {
    setAddress(e.target.value);
  };

  const onInstantSwapChange = e => {
    setInstantSwap(e.target.checked);
  };

  const handlePrevStep = () => {
    history.push('/');
  };

  const nextStepHandler = () => {
    const preImage = randomBytes(32);
    const body = {
      pairId,
      orderSide,
      type: SwapTypes.ReverseSubmarine,
      invoiceAmount: Math.round(sendAmount),
      preimageHash: getHexString(crypto.sha256(preImage)),
    };

    if (isEthereum) {
      body.claimAddress = account;
      body.prepayMinerFee = ethereumPrepayMinerFee;
    } else {
      body.claimPublicKey = keys.publicKey || '';
    }

    createReverseSwap(
      dispatch,
      body,
      handleNextStep,
      {
        preImage,
        address,
        instantSwap,
        privateKey: keys.privateKey,
      },
      signer,
    );
    localStorage.setItem(
      LocalStorageState.ExtraDetails,
      JSON.stringify({
        pairId,
        preImage,
        instantSwap,
        address: address,
        privateKey: keys.privateKey,
      }),
    );
  };

  const renderHeader = () => (
    <Typography
      variant='div'
      component='h2'
      align='center'
      className='submarine__destination_header'
    >
      Scan or paste a {receiveCurrency.label} address you'd like to receive the fund on.
    </Typography>
  );

  const renderInvoiceFields = () => (
    <div className='submarine__destination_invoice_group'>
      <div className='invoice-header'>
        <div>{receiveCurrency.label} receiving address</div>
      </div>
      <TextareaAutosize
        className={'invoice-input'}
        rows={6}
        cols={77}
        placeholder='Paste the address'
        value={address}
        onChange={onAddressChange}
      />
      {!!address && !isAddressValid(address, currencyNetwork) && (
        <div className={'error-msg'}>Invalid address</div>
      )}
    </div>
  );

  if (isEthereum) {
    return (
      <EthereumAccount
        account={account}
        etherSendAmount={0}
        isReverseSwap={true}
        handleBack={handlePrevStep}
        handleNextStep={nextStepHandler}
        isEther={receiveCurrency.type === CurrencyTypes.Ether}
      />
    );
  }

  return (
    <div className='submarine__destination'>
      {renderHeader()}
      {renderInvoiceFields()}
      <div className='submarine__destination_invoice_footer'>
        <Divider />
        <FormControlLabel
          control={<Switch
            checked={instantSwap}
            onChange={onInstantSwapChange}
            color='primary'
            name='download'
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />}
          label={<div>
            Swap Instantly
            <img
              src={svgIcons.questionIcon}
              alt='question-icon'
              className='question-icon'
              onMouseEnter={handleInstantSwapPopoverOpen}
              onMouseLeave={handleInstantSwapPopoverClose}
            />
          </div>}
        />
        <div className='action-buttons'>
          <Button variant='outlined' onClick={handlePrevStep}>
            <img src={svgIcons.leftArrow} alt='' />
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={nextStepHandler}
            className='next-step-button'
            disabled={!address || !isAddressValid(address, currencyNetwork)}
          >
            Go to next step
          </Button>
        </div>
      </div>
      <Popover
        id='instant-swap-popover'
        open={instantSwapOpen}
        anchorEl={instantSwapAnchorEl}
        onCloseHandler={handleInstantSwapPopoverClose}
        text='Enabling swap instantly means you agree to accept a 0-conf transaction from Boltz, which results in an instant swap.'
      />
    </div>
  );
};

export default Destination;
