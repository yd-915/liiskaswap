import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
  FormControl,
  makeStyles,
} from '@material-ui/core';
import React, { ReactElement } from 'react';

export type ButtonProps = MuiButtonProps & {
  loading?: boolean;
};

const isDefaultColor = (props: ButtonProps): boolean => !props.color || props.color === 'default';

const useStyles = makeStyles(theme => ({
  button: (props: ButtonProps) => ({
    borderRadius: 0,
    backgroundColor: isDefaultColor(props) && props.variant === 'contained'
      ? 'rgb(0, 110, 255)'
      : undefined,
    '&:hover': {
      backgroundColor: isDefaultColor(props)
        ? 'rgb(98, 0, 255)'
        : undefined,
    },
    color: isDefaultColor(props) ? theme.palette.text.primary : undefined,
  }),
  buttonWrapper: {
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));

const Button = (props: ButtonProps): ReactElement => {
  const { className, loading, ...muiButtonProps } = props;
  const classes = useStyles(props);
  const buttonClass = `${classes.button} ${className}`;

  return (
    <FormControl fullWidth={muiButtonProps.fullWidth}>
      <div className={classes.buttonWrapper}>
        <MuiButton
          disableElevation
          className={buttonClass}
          {...muiButtonProps}
        />
        {loading && (
          <CircularProgress size={24} className={classes.buttonProgress} />
        )}
      </div>
    </FormControl>
  );
};

export default Button;
