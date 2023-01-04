import { Button, Divider, TextareaAutosize, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CurrencyTypes } from '../../constants/submarine';
import { clearRefundState, startRefund } from '../../services/refund/refundDuck';
import {
  selectETA,
  selectFileDetails,
  selectSwapId,
  selectTransactionHash,
} from '../../services/refund/refundSelectors';
import { getETALabel } from '../../services/refund/timestamp';
import svgIcons from '../../utils/svgIcons';

const Status = ({ handleNextStep, handlePrevStep }) => {
  const dispatch = useDispatch();

  const swapId = useSelector(selectSwapId);
  const refundFile = useSelector(selectFileDetails);
  const transactionHash = useSelector(selectTransactionHash);
  const { eta: ETA, label: etaLabel } = useSelector(selectETA);

  const [etaLeft, setETALeft] = useState(ETA);
  const [address, setAddress] = useState('');
  const [etaTimeDiffLabel, setEtaTimeDiffLabel] = useState('');

  const needAddressInput = refundFile.type !== CurrencyTypes.Ether
    && refundFile.type !== CurrencyTypes.ERC20;
  const addressNetwork = refundFile.currency === 'BTC' ? 'Bitcoin' : 'Litecoin';

  const nextStepHandler = () => {
    startRefund(refundFile, address, transactionHash, handleNextStep, dispatch);
  };

  const onAddressChange = e => {
    setAddress(e?.target?.value);
  };

  useEffect(() => {
    setEtaTimeDiffLabel(getETALabel(etaLeft).label);

    setTimeout(() => {
      setETALeft(etaLeft - 1);
    }, 60 * 1000);
  }, [etaLeft]);

  return (
    <div className='refund__check-status'>
      <img src={svgIcons.clock} alt='' />
      <Typography
        variant='div'
        component='h2'
        align='center'
        className='refund__check-status-header'
      >
        Swap {swapId} is {etaLeft > 0 ? `almost` : null} expired
      </Typography>
      {etaLeft > 0
        ? (
          <div className='sub-heading'>
            Expires in {etaTimeDiffLabel || etaLabel}
          </div>
        )
        : null}
      <div className='message'>
        You can refund {etaLeft > 0 ? 'when the Swap has expired' : 'now'}.
      </div>
      {needAddressInput
        ? (
          <div className={'address-wrapper'}>
            <div>{addressNetwork} destination address</div>
            <TextareaAutosize
              className={'invoice-input'}
              rows={5}
              cols={72}
              placeholder={`Enter ${addressNetwork} address`}
              value={address}
              onChange={onAddressChange}
              disabled={etaLeft > 0}
            />
          </div>
        )
        : null}
      <div className='refund__check-status-footer'>
        <Divider />
        <div className='action-buttons'>
          <Button
            variant='outlined'
            onClick={() => {
              dispatch(clearRefundState());
              handlePrevStep();
            }}
          >
            <img src={svgIcons.leftArrow} alt='' />
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={nextStepHandler}
            className='next-step-button'
            disabled={needAddressInput ? !address : etaLeft > 0}
          >
            Start Refund
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Status;
