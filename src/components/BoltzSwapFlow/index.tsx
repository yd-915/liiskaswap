import { createStyles, makeStyles } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { isCurrencyOnChain } from '../../constants/boltzRates';
import { SwapFlowProps } from '../../pages/home';
import BoltzReverseSwap from './components/BoltzReverseSwap';
import BoltzSubmarineSwap from './components/BoltzSubmarineSwap';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
      'flex-direction': 'column',
      'justify-content': 'space-between',
      flex: 1,
      minHeight: 440,
    },
  })
);

const BoltzSwapFlow = (props: SwapFlowProps): ReactElement => {
  const classes = useStyles();
  const { sendAsset, receiveAsset } = props;

  const component = () => {
    if (
      isCurrencyOnChain(sendAsset)
      && !isCurrencyOnChain(receiveAsset)
    ) {
      return <BoltzSubmarineSwap {...props} />;
    }
    if (
      !isCurrencyOnChain(sendAsset)
      && isCurrencyOnChain(receiveAsset)
    ) {
      return <BoltzReverseSwap {...props} />;
    }
  };

  return (
    <div className={classes.root}>
      {component() || <div>Not implemented</div>}
    </div>
  );
};

export default BoltzSwapFlow;
