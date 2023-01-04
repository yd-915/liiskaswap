import { createStyles, Grid, makeStyles } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../pages/home';

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      marginBottom: '2rem',
    },
    link: {
      color: theme.palette.text.primary,
      fontSize: '1rem',
      letterSpacing: '0.67px',
      textDecoration: 'none',
    },
  })
);

export default function BoltzRefundLink(): ReactElement {
  const classes = useStyles();

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
        <Link
          to={ROUTES.BOLTZ_REFUND}
          className={classes.link}
        >
          Check swap status or refund
        </Link>
      </Grid>
    </Grid>
  );
}
