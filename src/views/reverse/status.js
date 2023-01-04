import { Button, Divider } from '@material-ui/core';
import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { LocalStorageState } from '../../constants/environment';
import { StepsContext } from '../../context/StepsContext';
import { UtilsContext } from '../../context/UtilsContext';
import { selectError } from '../../services/refund/refundSelectors';
import { selectClaimTransactionId } from '../../services/reverse/reverseSelectors';
import { selectReceiveCurrency, selectSendCurrency } from '../../services/submarine/submarineSelectors';
import { getBlockExplorerTransactionLink } from '../../utils/blockExplorerLink';
import svgIcons from '../../utils/svgIcons';

const Status = () => {
  const history = useHistory();

  const utilsContext = useContext(UtilsContext);
  const stepsContext = useContext(StepsContext);
  const { setReverseActiveStep } = stepsContext;

  const isMobileView = !!utilsContext?.isMobileView;

  const error = useSelector(selectError);
  const sendCurrency = useSelector(selectSendCurrency);
  const receiveCurrency = useSelector(selectReceiveCurrency);
  const claimTransactionId = useSelector(selectClaimTransactionId);

  localStorage.removeItem(LocalStorageState.ActiveSwap);

  const nextStepHandler = () => {
    setReverseActiveStep(1);
    history.push('/');
  };

  return (
    <div className='submarine__status'>
      <img src={error ? svgIcons.snap : svgIcons.greenTick} alt='' />
      {!error && (
        <div className='message'>
          You have successfully swapped
          <span className='highlight'>
            {sendCurrency.amount} {sendCurrency.label}
          </span>
          for{isMobileView ? <br /> : ''}
          <span className='highlight'>
            {receiveCurrency.amount} {receiveCurrency.label}
          </span>
        </div>
      )}
      <a
        className='explorer-link'
        href={
          // The user received the currency on which the claim transaction was sent
          getBlockExplorerTransactionLink(
            receiveCurrency.symbol,
            claimTransactionId,
          )
        }
        target='_blank'
        rel='noopener noreferrer'
      >
        <img src={svgIcons.externalLinkIcon} alt='external-link' />
        See on block explorer
      </a>
      {!!error && `${error}`}
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
