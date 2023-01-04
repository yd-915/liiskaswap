import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import Invoice from '../../components/Invoice';
import { explorers } from '../../constants/environment';
import { UtilsContext } from '../../context/UtilsContext';
import { selectEthereumPrepayMinerFeePaid, selectReverseSwapDetails } from '../../services/reverse/reverseSelectors';
import {
  selectReceiveCurrency,
  selectSendCurrency,
  selectSwapStatus,
} from '../../services/submarine/submarineSelectors';

const getBlockExplorerLink = (symbol, lockupAddress) => {
  let blockExplorer;

  switch (symbol) {
    case 'BTC':
      blockExplorer = explorers.bitcoin;
      break;
    case 'LTC':
      blockExplorer = explorers.litecoin;
      break;
    default:
      blockExplorer = explorers.ethereum;
  }

  return `${blockExplorer.address}${lockupAddress}`;
};

const Send = () => {
  const utilsContext = useContext(UtilsContext);
  const isMobileView = !!utilsContext?.isMobileView;

  const swapStatus = useSelector(selectSwapStatus);
  const sendCurrency = useSelector(selectSendCurrency);
  const swapDetails = useSelector(selectReverseSwapDetails);
  const receiveCurrency = useSelector(selectReceiveCurrency);
  const ethereumPrepayMinerFeePaid = useSelector(
    selectEthereumPrepayMinerFeePaid,
  );

  // Show the miner fee invoice if it exists and was not paid yet
  const invoice = !ethereumPrepayMinerFeePaid && swapDetails.minerFeeInvoice !== undefined
    ? swapDetails.minerFeeInvoice
    : swapDetails.invoice;

  return (
    <Invoice
      invoice={invoice}
      isMobileView={isMobileView}
      statusMessage={swapStatus.message}
      currencySymbol={sendCurrency.symbol}
      // TODO: this should show the actual ethereum transaction once it is sent
      lockupLink={getBlockExplorerLink(
        receiveCurrency.symbol,
        swapDetails.lockupAddress,
      )}
    />
  );
};

export default Send;
