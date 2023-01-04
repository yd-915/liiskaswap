import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';

import { EsploraByChain } from '../constants';

import svgIcons from '../../../utils/svgIcons';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  result: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(3),
    fontSize: '1.5rem',
    lineHeight: 'normal',
  },
  button: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(6),
  },
  image: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
}));

interface Props {
  chain: 'liquid' | 'regtest';
  txid: string;
  onNewTrade(): void;
}

const Summary: React.FC<Props> = ({ chain, txid, onNewTrade }) => {
  const classes = useStyles();

  const openInNewTab = url => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  return (
    <div className={classes.root}>
      <Typography className={classes.result}>Trade completed</Typography>
      <img src={svgIcons.success} alt='Success' className={classes.image} />
      <Button
        variant='contained'
        onClick={() => openInNewTab(`${EsploraByChain[chain]}/tx/${txid}`)}
      >
        Open in explorer
      </Button>
      <Button onClick={onNewTrade}>New trade</Button>
    </div>
  );
};

export default Summary;
