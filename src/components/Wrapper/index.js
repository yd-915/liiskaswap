import Drawer from '@material-ui/core/Drawer';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import CurrencyID, { CurrencyByID, CurrencyOptions } from '../../constants/currency';
import { UtilsContext } from '../../context/UtilsContext';
import SelectComponent from '../Select';
import SwapButton from '../SwapButton';
import DrawerContext from './DrawerContext';

const useStyles = makeStyles(theme => ({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
  content: {
    transition: theme.transitions.create('min-height', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    minHeight: 0,
  },
  contentShift: {
    transition: theme.transitions.create('min-height', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    minHeight: 500,
  },
  refundMinimised: {
    paddingTop: 15,
  },
}));

const Wrapper = props => {
  const classes = useStyles();
  const [openDrawer, setDrawer] = useState(false);
  const history = useHistory();
  const isDrawerOpen = history?.location?.state?.isDrawerOpen;
  const utilsContext = useContext(UtilsContext);
  const isMobileView = !!utilsContext?.isMobileView;
  const isRefundView = history?.location?.pathname === '/refund';
  const isSwapboxView = history?.location?.pathname === '/swapbox';

  useEffect(() => {
    if ((isRefundView || isSwapboxView) && isMobileView) {
      setDrawer(true);
    }
  }, [history, isMobileView, isRefundView, isSwapboxView]);

  useEffect(() => {
    setTimeout(() => {
      document.body.style.overflow = openDrawer ? 'hidden' : 'auto';
    }, 0);
  }, [openDrawer]);

  useEffect(() => {
    if (isDrawerOpen) {
      setDrawer(true);
      history.replace({
        pathname: history?.location?.pathname,
        state: {},
      });
    }
  }, [isDrawerOpen, history]);

  const drawerHandler = useCallback(
    nextState =>
      () => {
        setDrawer(nextState);
      },
    [],
  );

  const getMinimisedDrawerView = () => {
    switch (history?.location?.pathname) {
      case '/refund':
        return (
          <Typography
            variant='div'
            component='h3'
            align='center'
            className={classes.refundMinimised}
          >
            Check status or initiate refund of your coins
          </Typography>
        );

      default:
        return renderCryptoOptions();
    }
  };

  const getDrawerComponent = () => (
    <DrawerContext.Provider
      value={{
        closeDrawer: drawerHandler(false),
      }}
    >
      <Drawer
        className={`drawer-wrapper ${openDrawer ? 'open' : ''}`}
        anchor={'bottom'}
        open={true} // always open, to prevent unmounting of drawer component
        onClose={drawerHandler(false)}
        onOpen={drawerHandler(true)}
        disableBackdropTransition={false}
        transitionDuration={isSwapboxView ? 0 : 225}
      >
        <div
          className={`drawer-wrapper__content ${classes.fullList} ${classes.content} ${
            openDrawer ? classes.contentShift : ''
          }`}
          role='presentation'
        >
          {typeof props.children === 'function'
            ? React.cloneElement(props.children, {
              setDrawerOpen: drawerHandler(true),
            })
            : props.children}
          {props.children}
        </div>
      </Drawer>
    </DrawerContext.Provider>
  );

  const renderCryptoOptions = () => {
    return (
      <div className='submarine__pickcrypto-options'>
        <SelectComponent
          options={CurrencyOptions}
          variant='outlined'
          className='currency-options'
          value={CurrencyByID[CurrencyID.ETH_USDT]}
          disabled
        />
        <SwapButton />
        <SelectComponent
          options={CurrencyOptions}
          variant='outlined'
          className='currency-options'
          value={CurrencyByID[CurrencyID.LIGHTNING_BTC]}
          disabled
        />
      </div>
    );
  };

  if (isMobileView) {
    return (
      <div className={`homepage-drawer ${openDrawer ? 'open' : ''}`}>
        {!openDrawer && (
          <div
            className='drawer-options'
            role='presentation'
            onClick={drawerHandler(true)}
          >
            <button
              onClick={drawerHandler(true)}
              className='drawer-btn'
            >
            </button>
            {getMinimisedDrawerView()}
          </div>
        )}
        {getDrawerComponent()}
      </div>
    );
  }

  return (
    <div className='homepage-modal max-width-margin-right'>
      {props.children}
    </div>
  );
};

export default Wrapper;
