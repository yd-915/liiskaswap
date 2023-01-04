import { createStyles, makeStyles, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';

export type ErrorMessageProps = {
  message: string;
  className?: string;
};

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      fontFamily: 'ApercuProRegular',
    },
  })
);

const ErrorMessage = (props: ErrorMessageProps): ReactElement => {
  const { message, className } = props;
  const classes = useStyles();

  const rootClass = `${classes.root} ${className}`;

  return (
    <Typography color='error' align='center' className={rootClass}>
      {message}
    </Typography>
  );
};

export default ErrorMessage;
