import { createStyles, Grid, makeStyles, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { SwapProvider as Provider } from '../../constants/swap';
import svgIcons from '../../utils/svgIcons';
import { ternaryTextColor } from '../App/theme';

export type Props = {
  provider: Provider;
};

type ProviderInfo = {
  providerName: Provider;
  logos: ProviderLogo[];
};

type ProviderLogo = {
  source: string;
  alt: string;
};

const useStyles = makeStyles(() =>
  createStyles({
    text: {
      fontFamily: 'ApercuProRegular',
      color: ternaryTextColor,
      fontSize: '1rem',
      letterSpacing: '1px',
    },
    imageContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    image: {
      height: '1.25rem',
    },
    root: {
      marginBottom: '2rem',
    },
  })
);

const providerInfo: ProviderInfo[] = [
  {
    providerName: Provider.BOLTZ,
    logos: [
      { source: svgIcons.logo, alt: 'Boltz logo' },
      { source: svgIcons.boltz, alt: 'Boltz' },
    ],
  },
  {
    providerName: Provider.COMIT,
    logos: [{ source: svgIcons.comitLogo, alt: 'Comit' }],
  },
  {
    providerName: Provider.TDEX,
    logos: [{ source: svgIcons.tdexLogo, alt: 'TDex' }],
  },
];

export default function PoweredBy({ provider }: Props): ReactElement {
  const classes = useStyles();

  const serviceInfo = providerInfo.find(p => p.providerName === provider);

  return (
    <Grid
      item
      container
      justify='center'
      alignItems='center'
      wrap='nowrap'
      spacing={1}
      xs={12}
      className={classes.root}
    >
      <Grid item>
        <Typography className={classes.text}>Swap powered by</Typography>
      </Grid>
      {serviceInfo!.logos.map(logo => (
        <Grid item className={classes.imageContainer} key={logo.alt}>
          <img src={logo.source} alt={logo.alt} className={classes.image} />
        </Grid>
      ))}
    </Grid>
  );
}
