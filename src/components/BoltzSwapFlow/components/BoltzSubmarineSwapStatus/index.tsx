import React, { ReactElement, useState } from 'react';
import { useHistory } from 'react-router';
import { StatusResponse, swapSteps } from '../../../../constants/boltzSwap';
import { ROUTES } from '../../../../pages/home';
import { swapError } from '../../../../utils/boltzSwapStatus';
import BoltzSubmarineStatus from '../BoltzSubmarineStatus';
import BoltzSwapStep from '../BoltzSwapStep';

type BoltzSubmarineSwapStatusProps = {
  swapStatus: StatusResponse;
  swapId?: string;
};

const BoltzSubmarineSwapStatus = (
  props: BoltzSubmarineSwapStatusProps,
): ReactElement => {
  const { swapStatus, swapId } = props;
  const [activeStep, setActiveStep] = useState<number | undefined>(undefined);
  const history = useHistory();

  const swapInProgress = !swapError(swapStatus) && !!activeStep && activeStep < swapSteps.length;

  return (
    <BoltzSwapStep
      title='Swap status'
      content={<BoltzSubmarineStatus
        swapStatus={swapStatus}
        swapId={swapId}
        showRefundButton
        onActiveStepChange={setActiveStep}
      />}
      mainButtonDisabled={swapInProgress}
      mainButtonText={swapInProgress ? 'Swap in progress' : 'Start a new swap'}
      onMainButtonClick={() => {
        history.replace(ROUTES.HOME);
      }}
    />
  );
};

export default BoltzSubmarineSwapStatus;
