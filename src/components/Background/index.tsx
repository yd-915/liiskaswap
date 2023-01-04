import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { ReactNode } from 'react';

const useStyles = makeStyles(theme =>
  createStyles({
    outerCircle: {
      zIndex: -1,
      display: 'flex',
      position: 'fixed',
      opacity: '0.1',
      background:
        `linear-gradient(right bottom, ${theme.palette.background.default} 0%, ${theme.palette.primary.main} 100%)`,
      'border-radius': '50%',
      'align-items': 'center',
      'justify-content': 'center',
      height: '80vw',
      width: '80vw',
      top: 'max(-200px, calc(-60vw + 100px))',
      right: 'max(-200px, calc(-70vw + 100px))',
      'max-width': 675,
      'max-height': 675,
      'min-width': 180,
      'min-height': 180,
    },
    innerCircle: {
      background: theme.palette.background.default,
      'border-radius': '50%',
      height: 'calc(80vw - 75px)',
      width: 'calc(80vw - 75px)',
      'max-width': 600,
      'max-height': 600,
      'min-width': 150,
      'min-height': 150,
    },
    background: {
      zIndex: -2,
      position: 'fixed',
      height: '100%',
      width: '100%',
      background: '#8223ff',
      opacity: 0.1,
      backgroundImage: 'radial-gradient(circle at 30% 51%, #00A6FF, #0a0e1a 73%)',
    },
  })
);

export type BackgroundProps = {
  children: ReactNode;
};

const Background = ({ children }) => {
  const classes = useStyles();

  return (
    <>
      <div className={classes.background}></div>
      <div className={classes.outerCircle}>
        <div className={classes.innerCircle}></div>
      </div>
      {children}
    </>
  );
};

export default Background;
