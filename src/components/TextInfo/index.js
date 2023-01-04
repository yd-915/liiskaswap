import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme =>
  createStyles({
    container: {
      color: theme.palette.text.secondary,
    },
  })
);

const TextInfo = props => {
  const classes = useStyles();
  const { className, label, value, explanation = false } = props;
  return (
    <Grid container className={classes.container} justify='center'>
      <Grid item className={className} xs={12}>
        {label}
        {explanation}
      </Grid>
      <Grid item className={className} xs={12}>
        {value}
      </Grid>
    </Grid>
  );
};

export default TextInfo;
