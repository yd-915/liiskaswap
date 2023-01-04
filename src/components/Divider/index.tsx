import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Divider as MuiDivider } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      opacity: 0.3,
    },
  })
);

export type DividerProps = {};

const Divider = (_props: DividerProps) => {
  const classes = useStyles();

  return <MuiDivider className={classes.root} variant='middle' />;
};

export default Divider;
