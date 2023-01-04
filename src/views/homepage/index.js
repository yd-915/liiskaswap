import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Box, Divider } from '@material-ui/core';
import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Footer from '../../components/Footer';
import { LocalStorageState } from '../../constants/environment';
import { isEthereumCurrencyType } from '../../constants/submarine';
import { StepsContext } from '../../context/StepsContext';
import { UtilsContext } from '../../context/UtilsContext';
import * as reverseSubmarineActionCreators from '../../services/reverse/reverseDuck';
import * as submarineActionCreators from '../../services/submarine/submarineDuck';
import { selectContracts } from '../../services/submarine/submarineSelectors';
import { connectWeb3Modal } from '../../utils/web3modal';
import NavBar from './navbar';

const useStyles = makeStyles(() =>
  createStyles({
    box: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    },
  })
);
export default props => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  const utilsContext = useContext(UtilsContext);
  const isMobileView = !!utilsContext?.isMobileView;

  const contractAddresses = useSelector(selectContracts);

  if (history?.location?.pathname === '/swapbox' && !isMobileView) {
    history.push('/');
  }

  const stepsContext = useContext(StepsContext);
  const { setSubmarineActiveStep, setReverseActiveStep } = stepsContext;
  const activeSwap = localStorage.getItem(LocalStorageState.ActiveSwap);

  const currentSubmarineState = JSON.parse(
    localStorage.getItem(LocalStorageState.CurrentSubmarineState),
  );

  if (activeSwap === 'submarine') {
    submarineActionCreators.checkCurrentSwap(
      currentSubmarineState.swapDetails.data,
      dispatch,
      () => {
        setSubmarineActiveStep(3);
      },
    );
    setSubmarineActiveStep(2);
  } else if (activeSwap === 'reverse') {
    const currentReverseState = JSON.parse(
      localStorage.getItem(LocalStorageState.CurrentReverseState),
    );
    const extraDetails = JSON.parse(
      localStorage.getItem(LocalStorageState.ExtraDetails),
    );

    // Get a signer again if it is needed for the claim transaction
    if (isEthereumCurrencyType(currentSubmarineState.receiveCurrency.type)) {
      connectWeb3Modal(contractAddresses.ethereum.network).then(signer => {
        submarineActionCreators.checkCurrentSwap(
          currentReverseState.swapDetails,
          dispatch,
          () => {
            setReverseActiveStep(3);
          },
          reverseSubmarineActionCreators.handleReverseSwapStatus(
            extraDetails,
            signer,
          ),
        );
      });
    } else {
      submarineActionCreators.checkCurrentSwap(
        currentReverseState.swapDetails,
        dispatch,
        () => {
          setReverseActiveStep(3);
        },
        reverseSubmarineActionCreators.handleReverseSwapStatus(
          extraDetails,
          undefined,
        ),
      );
    }

    history.push({
      pathname: '/reverse',
      state: isMobileView ? { isDrawerOpen: true } : {},
    });
    setReverseActiveStep(2);
  }

  return (
    <Box className={classes.box}>
      <NavBar />
      <Divider variant='middle' />
      {props.children}
      <Footer />
    </Box>
  );
};
