import React, { ReactElement } from 'react';
import { StatusResponse } from '../../../../constants/boltzSwap';
import { swapError } from '../../../../utils/boltzSwapStatus';
import BoltzSwapResult from './../BoltzSwapResult';

type BoltzSubmarineSwapResultProps = {
  swapStatus: StatusResponse;
  swapId?: string;
  showRefundButton?: boolean;
};

const BoltzSubmarineSwapResult = (
  props: BoltzSubmarineSwapResultProps,
): ReactElement => {
  const { swapStatus, swapId, showRefundButton } = props;

  return (
    <BoltzSwapResult
      errorMessage={swapError(swapStatus)}
      swapId={swapId}
      showRefundButton={showRefundButton}
    />
  );
};

export default BoltzSubmarineSwapResult;
