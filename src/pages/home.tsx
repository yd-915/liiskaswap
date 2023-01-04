import { Grid } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { ExtractRouteParams } from 'react-router';
import { Redirect, Route, Switch } from 'react-router-dom';
import BoltzSwapFlow from '../components/BoltzSwapFlow';
import CardComponent from '../components/Card';
import ChooseTradingPair from '../components/ChooseTradingPair';
import ComitSwapFlow from '../components/ComitSwapFlow';
import NetworkSelection from '../components/NetworkSelection';
import PoweredBy from '../components/PoweredBy';
import TdexSwapFlow from '../components/TdexSwapFlow';
import Title from '../components/Title';
import CurrencyID from '../constants/currency';
import { SwapProvider } from '../constants/swap';
import Layout from '../layout/main';
import BoltzRefund from './BoltzRefund';

export default function HomePage(): ReactElement {
  return (
    <Layout>
      <Grid container direction='column' wrap='nowrap' alignItems='center'>
        <Title>Liiska CoinSwap</Title>
        <NetworkSelection />

        <Grid item container direction='column' wrap='nowrap'>
          <Switch>
            <Route
              path={ROUTES.NEW_SWAP}
              sensitive={true}
              strict={false}
              exact={true}
              render={(
                {
                  history,
                  match: {
                    params: {
                      swapProvider: matchedSwapProvider,
                      receiveAsset: matchedReceiveAsset,
                      sendAsset: matchedSendAsset,
                    },
                  },
                  location,
                },
              ) => {
                let search = new URLSearchParams(location.search);
                let sendAmount = search.get('sendAmount');
                let receiveAmount = search.get('receiveAmount');

                if (
                  !matchedSwapProvider || !matchedSendAsset || !matchedReceiveAsset || !sendAmount || !receiveAmount
                ) {
                  history.replace(ROUTES.HOME);
                  return null;
                }

                let swapProvider = matchedSwapProvider as SwapProvider;
                let sendAsset = matchedSendAsset as CurrencyID;
                let receiveAsset = matchedReceiveAsset as CurrencyID;

                if (!swapProvider || !sendAsset || !receiveAsset) {
                  history.replace(ROUTES.HOME);
                  return null;
                }

                return (
                  <>
                    <CardComponent>
                      <SwapFlow
                        provider={swapProvider}
                        sendAsset={sendAsset}
                        sendAmount={sendAmount}
                        receiveAsset={receiveAsset}
                        receiveAmount={receiveAmount}
                      />
                    </CardComponent>
                    {/* TODO: It may be better to "switch" here once on the provider and have dedicated PoweredByComit etc components that don't make any decisions internally */}
                    <PoweredBy provider={swapProvider} />
                  </>
                );
              }}
            />
            <Route
              path={ROUTES.BOLTZ_REFUND_DETAIL}
              sensitive={true}
              strict={false}
              exact={true}
              render={(
                {
                  match: {
                    params: {
                      swapId,
                    },
                  },
                },
              ) => {
                return (
                  <BoltzRefund swapId={swapId} />
                );
              }}
            />
            <Route exact path={ROUTES.BOLTZ_REFUND}>
              <BoltzRefund />
            </Route>
            <Route exact path={ROUTES.HOME}>
              <ChooseTradingPair />
            </Route>
            <Route path='*'>
              <Redirect to={ROUTES.HOME} />
            </Route>
          </Switch>
        </Grid>
      </Grid>
    </Layout>
  );
}

export const ROUTES = {
  HOME: '/',
  NEW_SWAP: '/swap/:swapProvider/:sendAsset/:receiveAsset',
  BOLTZ_REFUND_DETAIL: '/boltz/refund/:swapId',
  BOLTZ_REFUND: '/boltz/refund',
};

// copied from https://dev.to/0916dhkim/type-safe-usage-of-react-router-5c44
export const buildUrl = <P extends string>(
  path: P,
  params: ExtractRouteParams<P>,
  query: URLSearchParams, // TODO: Figure out how to make this typesafe
): string => {
  let ret: string = path;

  for (const key of Object.keys(params)) {
    ret = ret.replace(`:${key}`, params[key]);
  }

  return `${ret}?${query.toString()}`;
};

export interface SwapFlowProps {
  provider: SwapProvider;
  sendAsset: CurrencyID;
  receiveAsset: CurrencyID;
  sendAmount: string;
  receiveAmount: string;
}

function SwapFlow(props: SwapFlowProps) {
  switch (props.provider) {
    case SwapProvider.BOLTZ:
      return <BoltzSwapFlow {...props} />;
    case SwapProvider.TDEX:
      return <TdexSwapFlow {...props} />;
    case SwapProvider.COMIT:
      return <ComitSwapFlow {...props} />;
    default:
      return null;
  }
}
