import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { fetchAndUnblindUtxos, greedyCoinSelector, IdentityType } from 'ldk';
import React, { useState } from 'react';
import { Trade } from 'tdex-sdk';
import BrowserInjectOpenDex from '../utils/browserInject';

import CurrencyID from '../../../constants/currency';
import { toSatoshi } from '../utils/format';
import { CurrencyToAssetByChain, ExplorerByChain, ProviderWithMarket } from '../constants';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructions: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(6),
  },
  terms: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    fontSize: '1.25rem',
    lineHeight: 'normal',
  },
  buttons: {
    marginTop: theme.spacing(6),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
}));

interface SwapTerms {
  assetToBeSent: CurrencyID;
  amountToBeSent: number;
  assetToReceive: CurrencyID;
  amountToReceive: number;
}

interface Props {
  chain: 'liquid' | 'regtest';
  providerWithMarket: ProviderWithMarket;
  terms: SwapTerms;
  onTrade(txid: string): void;
  onReject(): void;
}

const Review: React.FC<Props> = ({
  onTrade,
  onReject,
  terms,
  chain,
  providerWithMarket,
}) => {
  const classes = useStyles();

  const [isLoading, setIsLoading] = useState(false);

  const explorer = ExplorerByChain[chain];

  const identity = new BrowserInjectOpenDex({
    chain,
    type: IdentityType.Inject,
    value: {
      windowProvider: 'marina',
    },
  });

  const handleConfirm = async () => {
    try {
      setIsLoading(true);

      const addrs = await (window as any).marina.getAddresses();
      const utxos = await fetchAndUnblindUtxos(addrs, explorer);

      const trade = new Trade({
        providerUrl: providerWithMarket.provider.endpoint,
        explorerUrl: explorer,
        coinSelector: greedyCoinSelector(),
        utxos,
      });

      const { precision, hash } = CurrencyToAssetByChain[chain][terms.assetToBeSent];
      const amountToBeSentInSatoshis = toSatoshi(
        terms.amountToBeSent,
        precision,
      );

      const isBuy = CurrencyToAssetByChain[chain][terms.assetToBeSent].hash
        === providerWithMarket.market.quoteAsset;

      let txid;
      if (isBuy) {
        txid = await trade.buy({
          market: providerWithMarket.market,
          amount: amountToBeSentInSatoshis,
          asset: hash,
          identity,
        });
      } else {
        txid = await trade.sell({
          market: providerWithMarket.market,
          amount: amountToBeSentInSatoshis,
          asset: hash,
          identity,
        });
      }

      setIsLoading(false);
      onTrade(txid);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className={classes.root}>
      <Typography className={classes.instructions}>
        Review the terms of the trade before confirming
      </Typography>
      <Typography className={classes.terms}>
        📤 You send {terms.amountToBeSent} of {terms.assetToBeSent}
      </Typography>
      <br />
      <Typography className={classes.terms}>
        📥 You receive {terms.amountToReceive} of {terms.assetToReceive}
      </Typography>
      {!isLoading
        ? (
          <div className={classes.buttons}>
            <Button onClick={onReject}>Reject</Button>
            <Button variant='contained' color='primary' onClick={handleConfirm}>
              Accept
            </Button>
          </div>
        )
        : (
          <CircularProgress />
        )}
    </div>
  );
};

export default Review;
