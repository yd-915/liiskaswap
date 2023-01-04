import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Button, Grid, Typography } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import AssetSelector from '../../components/AssetSelector';
import EthereumAccount from '../../components/EthereumAccount';
import SwapButton from '../../components/SwapButton';
import TextInfo from '../../components/TextInfo';
import CurrencyID, { CurrencyByID } from '../../constants/currency';
import { CurrencyTypes, isEthereumCurrencyType, isLightningCurrencyType } from '../../constants/submarine';
import { UtilsContext } from '../../context/UtilsContext';
import { setSigner } from '../../services/ethereum/ethereumDuck';
import { calculateMinerFee } from '../../services/submarine/minerFees';
import * as submarineActionCreators from '../../services/submarine/submarineDuck';
import { selectContracts, selectPairDetails } from '../../services/submarine/submarineSelectors';
import { roundToDecimals } from '../../utils/roundToDecimals';
import { connectWeb3Modal } from '../../utils/web3modal';
import { checkEtherBalance, checkTokenBalance } from './balanceChecks';

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
    amountsContainer: {
      marginTop: '1rem',
    },
  })
);

const decimals = 100000000;
let updateReceiveAmount = false;

const PickCrypto = props => {
  const classes = useStyles();
  const pairDetails = useSelector(selectPairDetails);
  const contractAddresses = useSelector(selectContracts);
  const [sendCurrencyType, handleSendCurrencyType] = useState(
    CurrencyByID[CurrencyID.ETH_USDT],
  );
  const [receiveCurrencyType, handleReceiveCurrencyType] = useState(
    CurrencyByID[CurrencyID.LIGHTNING_BTC],
  );
  const [sendCurrencyValue, handleSendCurrencyValue] = useState('');
  const [receiveCurrencyValue, handleReceiveCurrencyValue] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const history = useHistory();
  const utilsContext = useContext(UtilsContext);
  const isMobileView = !!utilsContext?.isMobileView;
  const isDrawerClosed = props.isDrawerClosed;
  // const [rateAnchorEl, setRateAnchorEl] = React.useState(null);
  // const [minerFeeAnchorEl, setMinerFeeAnchorEl] = React.useState(null);
  const [account, setAccount] = React.useState('');

  const handleRatePopoverOpen = event => {
    // setRateAnchorEl(event.currentTarget);
  };

  const handleRatePopoverClose = () => {
    // setRateAnchorEl(null);
  };

  const handleMinerFeePopoverOpen = event => {
    // setMinerFeeAnchorEl(event.currentTarget);
  };

  const handleMinerFeePopoverClose = () => {
    // setMinerFeeAnchorEl(null);
  };

  // const rateOpen = Boolean(rateAnchorEl);
  // const minerFeeOpen = Boolean(minerFeeAnchorEl);

  useEffect(() => {
    if (isDrawerClosed) {
      handleSendCurrencyValue('');
      handleReceiveCurrencyValue('');
      handleSendCurrencyType(CurrencyByID[CurrencyID.ETH_USDT]);
      handleReceiveCurrencyType(CurrencyByID[CurrencyID.LIGHTNING_BTC]);
    }
  }, [isDrawerClosed]);

  let effectiveRate = 0;

  let realPairId = '';
  let isMirrorPair = false;

  const getSelectedPairTypeDetails = () => {
    realPairId = `${sendCurrencyType?.symbol}/${receiveCurrencyType?.symbol}`;

    if (!pairDetails || Object.keys(pairDetails).length === 0) {
      const errorMessage = 'Failed to fetch pairs';

      if (error !== errorMessage) {
        setError(errorMessage);
      }

      return;
    }

    const pair = pairDetails[realPairId];

    if (pair) {
      isMirrorPair = false;
      return pair;
    } else {
      isMirrorPair = true;
      realPairId = `${receiveCurrencyType?.symbol}/${sendCurrencyType?.symbol}`;

      if (pairDetails[realPairId]) {
        return pairDetails[realPairId];
      } else {
        const errorMessage = 'Not supported';

        if (error !== errorMessage) {
          setError(errorMessage);
        }
      }
    }
  };

  const selectedPairDetails = getSelectedPairTypeDetails();

  const calculateLimits = value => {
    let limit = value / decimals;

    if (selectedPairDetails && selectedPairDetails.rate !== 1) {
      limit = isMirrorPair ? limit : limit / selectedPairDetails.rate;
    }

    return roundToDecimals(limit, 8);
  };

  const minimal = calculateLimits(selectedPairDetails?.limits?.minimal);
  const maximal = calculateLimits(selectedPairDetails?.limits?.maximal);

  const isSendCurrencyLightning = isLightningCurrencyType(
    sendCurrencyType?.swapValues?.type,
  );
  const isReceiveCurrencyLightning = isLightningCurrencyType(
    receiveCurrencyType?.swapValues?.type,
  );

  const isSendCurrencyEthereum = isEthereumCurrencyType(
    sendCurrencyType?.swapValues?.type,
  );
  const isReceiveCurrencyEthereum = isEthereumCurrencyType(
    receiveCurrencyType?.swapValues?.type,
  );

  useEffect(() => {
    const errorStr = (() => {
      if (
        sendCurrencyType !== receiveCurrencyType
        && !isSendCurrencyLightning
        && !isReceiveCurrencyLightning
      ) {
        return 'Coming soon';
      }

      if (
        (isSendCurrencyLightning && isReceiveCurrencyLightning)
        || sendCurrencyType === receiveCurrencyType
        || sendCurrencyValue < 0
        || receiveCurrencyValue < 0
      ) {
        return 'Invalid input';
      }

      if (!sendCurrencyValue) return true;
      if (sendCurrencyValue && sendCurrencyValue < minimal) {
        return `Amount ${sendCurrencyValue} is less than ${minimal}`;
      }

      if (sendCurrencyValue && sendCurrencyValue > maximal) {
        return `Amount ${sendCurrencyValue} is greater than ${maximal}`;
      }

      return '';
    })();

    setError(errorStr);
    // eslint-disable-next-line
  }, [
    maximal,
    minimal,
    sendCurrencyType,
    sendCurrencyValue,
    receiveCurrencyType,
    receiveCurrencyValue,
  ]);

  const minerFees = () =>
    calculateMinerFee(
      selectedPairDetails,
      sendCurrencyType,
      receiveCurrencyType,
      isMirrorPair,
      effectiveRate,
    );

  // Block non-numeric chars.
  const onNumberInputKeyPress = event => {
    if ((event.which < 47 || event.which > 58) && event.which !== 46) {
      event.preventDefault();
      return false;
    }
    return true;
  };

  const onSendCurrencyChange = ({ target: { value: val } }) => {
    const input = val;
    const value = Number(val);
    handleSendCurrencyValue(input);
    const newReceiveValue = Number(Number(value * effectiveRate).toFixed(8))
      - Number(minerFees()) * effectiveRate;
    handleReceiveCurrencyValue(Math.max(Number(newReceiveValue).toFixed(8), 0));
  };

  const onReceiveCurrencyChange = ({ target: { value: val } }) => {
    const input = val;
    const value = Number(val);
    const newSendValue = Number(Number(value / effectiveRate).toFixed(8)) + Number(minerFees());
    handleSendCurrencyValue(Number(newSendValue).toFixed(8));
    handleReceiveCurrencyValue(input);
  };

  /*
  const renderCryptoInput = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
          <TextField
            label="You send"
            defaultValue={2.3}
            variant="outlined"
            value={sendCurrencyValue}
            onChange={onSendCurrencyChange}
            type="number"
            onKeyPress={onNumberInputKeyPress}
            autoFocus
            inputProps={{
              min: 0,
              step: 0.0000001,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
          <TextField
            label="You receive"
            defaultValue={2.3}
            variant="outlined"
            value={receiveCurrencyValue}
            onChange={onReceiveCurrencyChange}
            type="number"
            onKeyPress={onNumberInputKeyPress}
            inputProps={{
              min: 0,
              step: 0.0000001,
            }}
          />
        </Grid>
      </Grid>
    );
  };
  */

  /*
  const selectSendAsset = () => {
    return (
      <Grid container className={classes.selectAsset}>
        <Grid item xs={6}>
          <TextField
            label="You send"
            defaultValue={2.3}
            variant="outlined"
            value={sendCurrencyValue}
            onChange={onSendCurrencyChange}
            type="number"
            onKeyPress={onNumberInputKeyPress}
            autoFocus
            inputProps={{
              min: 0,
              step: 0.0000001,
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <SelectComponent
            options={CurrencyOptions}
            variant="outlined"
            onChange={(val) => {
              handleSendCurrencyType(val);
              updateReceiveAmount = true;
            }}
            value={sendCurrencyType}
          />
        </Grid>
      </Grid>
    );
  };
  */

  /*
          <TextField
            label="You receive"
            defaultValue={2.3}
            variant="outlined"
            value={receiveCurrencyValue}
            onChange={onReceiveCurrencyChange}
            type="number"
            onKeyPress={onNumberInputKeyPress}
            inputProps={{
              min: 0,
              step: 0.0000001,
            }}
          />
          <SelectComponent
            options={CurrencyOptions}
            variant="outlined"
            onChange={(val) => {
              handleReceiveCurrencyType(val);
              updateReceiveAmount = true;
            }}
            value={receiveCurrencyType}
          />
    */

  const onSendAssetChange = asset => {
    handleSendCurrencyType(asset);
    updateReceiveAmount = true;
  };

  const onReceiveAssetChange = asset => {
    handleReceiveCurrencyType(asset);
    updateReceiveAmount = true;
  };

  const renderCryptoOptions = () => {
    return (
      <Grid
        container
        spacing={1}
        justify='center'
        direction='row'
        alignItems='center'
      >
        <AssetSelector
          label={'You send'}
          defaultValue={2.3}
          value={sendCurrencyValue}
          onAmountChange={onSendCurrencyChange}
          onAssetChange={onSendAssetChange}
          onKeyPress={onNumberInputKeyPress}
          selectedAsset={sendCurrencyType}
        />
        <Grid item xs={12}>
          <SwapButton onClick={handleSwapClick} />
        </Grid>
        <Grid item xs={12}>
          <AssetSelector
            label={'You receive'}
            defaultValue={3.2}
            value={receiveCurrencyValue}
            onAmountChange={onReceiveCurrencyChange}
            onAssetChange={onReceiveAssetChange}
            onKeyPress={onNumberInputKeyPress}
            selectedAsset={receiveCurrencyType}
          />
        </Grid>
      </Grid>
    );
  };

  /*
  const renderMobileViewInputs = () => (
    <Grid container>
      <Grid item>
        <TextField
          label="You send"
          defaultValue={2.3}
          variant="outlined"
          value={sendCurrencyValue}
          onChange={onSendCurrencyChange}
          type="number"
          autoFocus
          onKeyPress={onNumberInputKeyPress}
          inputProps={{
            min: 0,
          }}
        />
      </Grid>
      <SwapIcon onClick={handleSwapClick} className={"vertical"} />
      <Grid item>
        <TextField
          label="You receive"
          defaultValue={2.3}
          variant="outlined"
          value={receiveCurrencyValue}
          onChange={onReceiveCurrencyChange}
          type="number"
          onKeyPress={onNumberInputKeyPress}
          inputProps={{
            min: 0,
          }}
        />
      </Grid>
      <Grid item>
        <SelectComponent
          options={CurrencyOptions}
          variant="outlined"
          onChange={(val) => {
            handleSendCurrencyType(val);
            updateReceiveAmount = true;
          }}
          className="currency-options"
          value={sendCurrencyType}
        />
      </Grid>
      <Grid item>
        <SelectComponent
          options={CurrencyOptions}
          variant="outlined"
          onChange={(val) => {
            handleReceiveCurrencyType(val);
            updateReceiveAmount = true;
          }}
          className="currency-options"
          value={receiveCurrencyType}
        />
      </Grid>
    </Grid>
  );
  */

  const renderAmounts = () => {
    const percentageFee = selectedPairDetails
      ? selectedPairDetails.fees.percentage / 100
      : NaN;
    const rate = selectedPairDetails
      ? selectedPairDetails.rate * (1 - percentageFee)
      : NaN;
    effectiveRate = isMirrorPair ? 1 / rate : rate;

    // Update the "You receive" value when the pair was changed
    if (updateReceiveAmount && sendCurrencyValue !== '') {
      onSendCurrencyChange({ target: { value: sendCurrencyValue } });
      updateReceiveAmount = false;
    }

    return (
      <Grid container className={classes.amountsContainer} justify='center'>
        <Grid item className={classes.amount} xs={6}>
          <TextInfo
            label='Min amount'
            value={`${minimal} ${sendCurrencyType?.symbol}`}
          />
        </Grid>
        <Grid item className={classes.amount} xs={6}>
          <TextInfo
            label='Max amount'
            value={`${maximal} ${sendCurrencyType?.symbol}`}
            className={classes.right}
          />
        </Grid>
        <Grid item className={classes.amount} xs={6}>
          <TextInfo
            label='Rate'
            value={`1 ${sendCurrencyType?.symbol} = ${
              roundToDecimals(
                effectiveRate,
                5,
              )
            } ${receiveCurrencyType?.symbol}`}
            explanation={true}
            onMouseEnterHandler={handleRatePopoverOpen}
            onMouseLeaveHandler={handleRatePopoverClose}
          />
        </Grid>
        <Grid item className={classes.amount} xs={6}>
          <TextInfo
            label='Miner fee'
            value={`${minerFees()} ${sendCurrencyType?.symbol}`}
            explanation={true}
            onMouseEnterHandler={handleMinerFeePopoverOpen}
            onMouseLeaveHandler={handleMinerFeePopoverClose}
            className={classes.right}
          />
        </Grid>
      </Grid>
    );
  };

  const handleNextStep = async () => {
    const prepareCurrency = (currencyType, currencyValue) => {
      return {
        amount: currencyValue,
        symbol: currencyType?.symbol,
        type: currencyType?.swapValues?.type,
        label: currencyType?.swapValues?.label,
      };
    };

    submarineActionCreators.setPair(dispatch, {
      pairId: realPairId,
      orderSide: isMirrorPair ? 'buy' : 'sell',

      sendCurrency: prepareCurrency(sendCurrencyType, sendCurrencyValue),
      receiveCurrency: prepareCurrency(
        receiveCurrencyType,
        receiveCurrencyValue,
      ),
    });

    if (isSendCurrencyLightning && !isReceiveCurrencyLightning) {
      history.push({
        pathname: '/reverse',
        state: isMobileView ? { isDrawerOpen: true } : {},
      });
    } else {
      props.handleNextStep();
    }
  };

  const handleBack = () => {
    setAccount('');
  };

  const connectEthereumWallet = async () => {
    const signer = await connectWeb3Modal(contractAddresses.ethereum.network);
    const account = await signer.getAddress();

    const backendEthereumNetwork = contractAddresses.ethereum.network;

    if (
      (await signer.provider.getNetwork()).chainId
        !== backendEthereumNetwork.chainId
    ) {
      setError(
        `Ethereum wallet is not on network ${backendEthereumNetwork.name
          || `with id ${backendEthereumNetwork.chainId}`}`,
      );
      return;
    }

    let hasEnoughBalance = true;

    switch (sendCurrencyType.swapValues.type) {
      case CurrencyTypes.Ether:
        hasEnoughBalance = await checkEtherBalance(signer, sendCurrencyValue);
        break;

      case CurrencyTypes.ERC20:
        const contractAddress = contractAddresses.ethereum.tokens[sendCurrencyType.symbol];
        hasEnoughBalance = await checkTokenBalance(
          signer,
          contractAddress,
          sendCurrencyValue,
        );
        break;

      default:
        break;
    }

    if (!hasEnoughBalance) {
      setError(`Insufficient ${sendCurrencyType.symbol}`);
    } else {
      dispatch(setSigner(signer));

      if (isReceiveCurrencyEthereum) {
        await handleNextStep();
      } else {
        setAccount(account);
      }
    }
  };

  const handleSwapClick = () => {
    const prevSendCurrencyType = CurrencyByID[sendCurrencyType.id];
    handleSendCurrencyType(receiveCurrencyType);
    handleReceiveCurrencyType(prevSendCurrencyType);
  };

  if (account) {
    const isEther = sendCurrencyType.swapValues.type === CurrencyTypes.Ether
      || receiveCurrencyType.swapValues.type === CurrencyTypes.Ether;

    return (
      <EthereumAccount
        account={account}
        handleNextStep={handleNextStep}
        isEther={isEther}
        isReverseSwap={isReceiveCurrencyEthereum}
        etherSendAmount={isSendCurrencyEthereum && isEther ? Number(sendCurrencyValue) : 0}
        handleBack={handleBack}
      />
    );
  }

  const showConnectEthereumWalletButton = isSendCurrencyEthereum || isReceiveCurrencyEthereum;

  // {renderAmounts()}
  // {isMobileView && renderMobileViewInputs()}
  // {renderCryptoInput()}
  /*
      {error && <div className={"error-msg"}>{error}</div>}
      <Popover
        id="rate-popover"
        open={rateOpen}
        anchorEl={rateAnchorEl}
        onCloseHandler={handleRatePopoverClose}
        text="This is cross currency conversion rate minus the Boltz service fee."
      />
      <Popover
        id="miner-fee-popover"
        open={minerFeeOpen}
        anchorEl={minerFeeAnchorEl}
        onCloseHandler={handleMinerFeePopoverClose}
        text="Miner fee is an approximate amount charged by miners to include the transaction."
      />
  */
  return (
    <div className={classes.root}>
      <Grid container justify='center' className={classes.content}>
        <Typography
          className={classes.text}
          variant='div'
          component='h2'
          align='center'
        >
          What would you like to exchange?
        </Typography>
        {renderCryptoOptions()}
        {renderAmounts()}
      </Grid>
      <Button
        disabled={error}
        variant='contained'
        color='primary'
        onClick={showConnectEthereumWalletButton
          ? connectEthereumWallet
          : handleNextStep}
      >
        {showConnectEthereumWalletButton ? 'Connect wallet' : 'Go to next step'}
      </Button>
    </div>
  );
};

export default PickCrypto;
