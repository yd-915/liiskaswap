import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import CardComponent from '../../components/Card';
import StepperComponent from '../../components/Stepper';
import Wrapper from '../../components/Wrapper';
import { refundSteps } from '../../constants/refund';
import { StepsContext } from '../../context/StepsContext';
import svgIcons from '../../utils/svgIcons';

const Refund = () => {
  const stepsContext = useContext(StepsContext);
  const { refundActiveStep, setRefundActiveStep } = stepsContext;

  return (
    <Wrapper>
      <div className='refund'>
        <CardComponent>
          <StepperComponent
            steps={refundSteps}
            activeStep={refundActiveStep}
            changeActiveStep={setRefundActiveStep}
          >
          </StepperComponent>
        </CardComponent>
      </div>
      <Link to='/' className={'modal-btn'}>
        <img src={svgIcons.leftArrow} alt='' /> Back
      </Link>
    </Wrapper>
  );
};

export default Refund;
