import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import React, { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import CardComponent from '../../components/Card';
import StepperComponent from '../../components/Stepper';
import { SubmarineSteps } from '../../constants/submarine';
import { StepsContext } from '../../context/StepsContext';
import * as submarineActionCreators from '../../services/submarine/submarineDuck';

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      flex: 1,
      margin: '2rem 0',
    },
    refundContainer: {
      marginTop: '1rem',
    },
    refundLabel: {
      color: theme.palette.text.secondary,
    },
  })
);

const Submarine = () => {
  const classes = useStyles();
  const stepsContext = useContext(StepsContext);
  const { submarineActiveStep, setSubmarineActiveStep } = stepsContext;

  const dispatch = useDispatch();
  const showRefundLink = submarineActiveStep === 0;
  const refundLabel = 'I want to check status or get refund';

  useEffect(() => {
    submarineActionCreators.getPairs(dispatch);
  }, [dispatch]);

  return (
    <Grid
      container
      justify='start'
      direction='column'
      alignItems='center'
      className={classes.card}
    >
      <Grid item container justify='center'>
        <Grid item xs={11} sm={9} md={6} lg={4} xl={3}>
          <CardComponent>
            <StepperComponent
              steps={SubmarineSteps}
              activeStep={submarineActiveStep}
              changeActiveStep={setSubmarineActiveStep}
            />
          </CardComponent>
        </Grid>
      </Grid>
      <Grid item className={classes.refundContainer}>
        {showRefundLink
          ? (
            <Link to='/refund' className={classes.refundLabel}>
              {refundLabel}
            </Link>
          )
          : (
            <span className={'modal-btn disabled'}>{refundLabel}</span>
          )}
      </Grid>
    </Grid>
  );
};

export default Submarine;
