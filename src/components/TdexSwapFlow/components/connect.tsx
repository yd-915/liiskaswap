import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructions: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  button: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

interface Props {
  installed: boolean;
  connected: boolean;
  onConnect(): void;
}

const Connect: React.FC<Props> = ({ onConnect, installed, connected }) => {
  const classes = useStyles();

  const handleInstall = () => {
    const newWindow = window.open(
      'https://chrome.google.com/webstore/detail/nhanebedohgejbllffboeipobccgedhl',
      '_blank',
      'noopener,noreferrer',
    );
    if (newWindow) newWindow.opener = null;
  };

  const handleConnect = async () => {
    if (!installed) {
      return alert('Marina is not installed');
    }

    await (window as any).marina.enable();
  };

  const goAhead = async () => {
    if (!installed) {
      return alert('Marina is not installed');
    }

    if (!connected) {
      return alert('User must enable this website to proceed');
    }

    onConnect();
  };

  return (
    <div className={classes.root}>
      {installed && connected
        ? (
          <>
            <Typography className={classes.instructions}>🎉 Connected</Typography>
            <Button variant='contained' color='primary' onClick={goAhead}>
              Go ahead
            </Button>
          </>
        )
        : (
          <>
            <Typography className={classes.instructions}>
              Connect your wallet
            </Typography>
            {installed
              ? (
                <Button
                  className={classes.button}
                  variant='contained'
                  color='primary'
                  onClick={handleConnect}
                >
                  Connect with Marina Wallet
                </Button>
              )
              : (
                <Button
                  className={classes.button}
                  variant='contained'
                  color='primary'
                  onClick={handleInstall}
                >
                  Install Marina Wallet extension
                </Button>
              )}
            <Button
              className={classes.button}
              variant='contained'
              disabled
              onClick={handleConnect}
            >
              In-browser wallet (coming soon)
            </Button>
          </>
        )}
    </div>
  );
};

export default Connect;
