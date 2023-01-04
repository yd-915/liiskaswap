import { createStyles, FormControl, Grid, makeStyles, MenuItem, Select } from '@material-ui/core';
import React, { ReactElement, useState } from 'react';
import BoltzRefundBitcoinLike from '../components/BoltzSwapFlow/components/BoltzRefundBitcoinLike';
import BoltzRefundEth from '../components/BoltzSwapFlow/components/BoltzRefundEth';
import CardComponent from '../components/Card';
import CurrencyID from '../constants/currency';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
      'flex-direction': 'column',
      'justify-content': 'space-between',
      flex: 1,
      minHeight: 440,
    },
    select: {
      marginTop: '2rem',
    },
  })
);

type CurrencyOption = {
  id: CurrencyID;
  label?: string;
};

const assetOptions: CurrencyOption[] = [
  { id: CurrencyID.BTC },
  { id: CurrencyID.ETH, label: 'ETH/ERC20' },
  {
    id: CurrencyID.LTC,
  },
];

const BoltzRefund = (props: { swapId?: string }): ReactElement => {
  const classes = useStyles();
  const [asset, setAsset] = useState(assetOptions[0]);

  const assetIsBitcoinLike = asset.id === CurrencyID.BTC || asset.id === CurrencyID.LTC;

  return (
    <Grid container direction='column' wrap='nowrap' alignItems='center'>
      <Grid item container direction='column' wrap='nowrap'>
        <CardComponent>
          <div className={classes.root}>
            <Grid item container justify='center' className={classes.select}>
              <FormControl variant='outlined'>
                <Select
                  value={asset.id}
                  onChange={e =>
                    setAsset(
                      assetOptions.find(
                        option => option.id === e.target.value,
                      )!,
                    )}
                >
                  {assetOptions.map(assetOption => {
                    return (
                      <MenuItem value={assetOption.id} key={assetOption.id}>
                        {assetOption.label || assetOption.id}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            {assetIsBitcoinLike
              ? (
                <BoltzRefundBitcoinLike swapId={props.swapId} asset={asset.id} />
              )
              : (
                <BoltzRefundEth />
              )}
          </div>
        </CardComponent>
      </Grid>
    </Grid>
  );
};

export default BoltzRefund;
