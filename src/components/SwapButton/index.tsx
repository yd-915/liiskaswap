import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { ReactElement } from 'react';
import svgIcons from '../../utils/svgIcons';
import Button from '../Button';

export type SwapButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

const useStyles = makeStyles(() =>
  createStyles({
    wrapper: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '1rem',
      marginBottom: '1rem',
    },
    button: {
      width: 48,
      minWidth: 48,
      height: 48,
      padding: 16,
    },
    icon: {
      transform: 'rotate(270deg)',
      margin: -3,
    },
    upIcon: {
      opacity: 0.4,
    },
  })
);

const SwapButton = ({ onClick, disabled }: SwapButtonProps): ReactElement => {
  const classes = useStyles();

  const upIconClass = `${classes.icon} ${classes.upIcon}`;

  return (
    <div className={classes.wrapper} onClick={onClick}>
      <Button
        variant='contained'
        className={classes.button}
        disabled={disabled}
      >
        <img
          src={svgIcons.rightArrowPlain}
          alt='Icon Up'
          className={upIconClass}
        />
        <img
          src={svgIcons.leftArrow}
          alt='Icon Down'
          className={classes.icon}
        />
      </Button>
    </div>
  );
};

export default SwapButton;
