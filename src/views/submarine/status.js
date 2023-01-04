import { Button, Divider } from '@material-ui/core';
import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { UtilsContext } from '../../context/UtilsContext';
import {
  selectChannelCreation,
  selectReceiveCurrency,
  selectSendCurrency,
} from '../../services/submarine/submarineSelectors';
import { getBlockExplorerTransactionLink } from '../../utils/blockExplorerLink';
import svgIcons from '../../utils/svgIcons';

const Status = ({ handleNextStep }) => {
  const sendCurrency = useSelector(selectSendCurrency);
  const receiveCurrency = useSelector(selectReceiveCurrency);
  const channelCreation = useSelector(selectChannelCreation);

  const isChannelCreation = channelCreation !== undefined;

  const utilsContext = useContext(UtilsContext);
  const isMobileView = !!utilsContext?.isMobileView;

  const nextStepHandler = () => {
    handleNextStep();
  };

  return (
    <div className='submarine__status'>
      <img src={svgIcons.greenTick} alt='' />
      <div className='message'>
        You have successfully swapped
        <span className='highlight'>
          {sendCurrency.amount} {sendCurrency.label}
        </span>
        for{isMobileView ? <br /> : ''}
        <span className='highlight'>
          {receiveCurrency.amount} {receiveCurrency.label}
        </span>
        {isChannelCreation
          ? (
            <a
              href={getBlockExplorerTransactionLink(
                receiveCurrency.symbol,
                channelCreation.fundingTransactionId,
              )}
              target='_blank'
              rel='noopener noreferrer'
            >
              via a new channel from Boltz
            </a>
          )
          : null}
      </div>
      <div className='submarine__status-footer'>
        <Divider />
        <Button
          variant='contained'
          color='primary'
          onClick={nextStepHandler}
          className='next-step-button'
        >
          Swap again
        </Button>
      </div>
    </div>
  );
};

export default Status;
