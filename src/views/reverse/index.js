import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import CardComponent from '../../components/Card';
import StepperComponent from '../../components/Stepper';
import Wrapper from '../../components/Wrapper';
import { ReverseSteps } from '../../constants/reverse';
import { StepsContext } from '../../context/StepsContext';

const Reverse = () => {
  const stepsContext = useContext(StepsContext);
  const { reverseActiveStep, setReverseActiveStep } = stepsContext;

  const showRefundLink = reverseActiveStep === 0;
  const refundLabel = 'I want to check status or get refund';

  return (
    <Wrapper>
      <div className='submarine reverse'>
        <CardComponent>
          <StepperComponent
            steps={ReverseSteps}
            activeStep={reverseActiveStep}
            changeActiveStep={setReverseActiveStep}
          >
          </StepperComponent>
        </CardComponent>
      </div>
      {showRefundLink
        ? (
          <Link to='/refund' className={'modal-btn'}>
            {refundLabel}
          </Link>
        )
        : (
          <span className={'modal-btn disabled'}>{refundLabel}</span>
        )}
    </Wrapper>
  );
};

export default Reverse;
