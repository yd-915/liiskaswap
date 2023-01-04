import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import React, { ReactNode } from 'react';

const useStyles = makeStyles(() =>
  createStyles({
    title: {
      marginTop: '2rem',
      fontSize: '2rem',
      fontWeight: 500,
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 'normal',
      letterSpacing: '1.33px',
      textAlign: 'center',
    },
  })
);

export type TitleProps = {
  children: ReactNode;
};

const Title = ({ children }) => {
  const classes = useStyles();

  return (
    <Typography className={classes.title} component='h1' align='center'>
      {children}
    </Typography>
  );
};

export default Title;
