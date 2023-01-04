import CircularProgress from '@material-ui/core/CircularProgress';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { MarinaProvider } from 'marina-provider';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import CurrencyID from '../../constants/currency';
import { useAppSelector } from '../../store/hooks';
import { seletctBestProvider } from '../../store/tdex-slice';
import Connect from './components/connect';
import Review from './components/review';
import TdexSteps from './components/steps';
import Summary from './components/summary';

interface Props {
  sendAsset: CurrencyID;
  receiveAsset: CurrencyID;
  sendAmount: string;
  receiveAmount: string;
}

const useStyles = makeStyles(theme =>
  createStyles({
    wrapper: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      marginTop: '1rem',
      marginBottom: '1rem',
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    info: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      paddingLeft: '25px',
      paddingRight: '25px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    },
    infoText: {
      flex: '1 1 100%',
      wordWrap: 'break-word',
      wordBreak: 'break-all',
    },
  })
);

const steps = ['Connect', 'Review & Confirm', 'Summary'];

enum Steps {
  Connect,
  Review,
  Summary,
}

const TdexSwapFlow: React.FC<Props> = ({ sendAsset, receiveAsset, sendAmount, receiveAmount }) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(Steps.Connect);
  let history = useHistory();

  const bestProvider = useAppSelector(seletctBestProvider);

  if (!bestProvider) throw new Error('TDEX: no provider has been selected');

  const [isLoading, setIsLoading] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [chain, setChain] = useState<'liquid' | 'regtest'>('liquid');
  const [txid, setTxid] = useState('');

  useEffect(() => {
    let isCheckingMarina = false;
    const interval = setInterval(async () => {
      try {
        const marina: MarinaProvider = (window as any).marina;

        if (marina === undefined) return;

        setInstalled(true);

        const net = await marina.getNetwork();
        setChain(net);

        if (isCheckingMarina) return;
        isCheckingMarina = true;

        if (activeStep > Steps.Connect) return;
        const isEnabled = await marina.isEnabled();
        setConnected(isEnabled);

        if (isEnabled && activeStep === Steps.Connect) {
          // skip directly to Review step
          setActiveStep(Steps.Review);
        }
      } catch (error) {
        console.log(error);
        alert(error.message);
      } finally {
        setIsLoading(false);
        isCheckingMarina = false;
      }
    }, 1000);

    // Clean up
    return () => {
      clearInterval(interval);
    };
  }, [activeStep]);

  const handleTradeCompleted = (txid: string) => {
    setTxid(txid);
    setActiveStep(Steps.Summary);
  };

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleGoBack = () => {
    history.goBack();
  };

  const getStepContent = () => {
    switch (activeStep) {
      case Steps.Connect:
        return (
          <Connect
            installed={installed}
            connected={connected}
            onConnect={handleNext}
          />
        );
      case Steps.Review:
        return (
          <Review
            chain={chain}
            providerWithMarket={bestProvider}
            terms={{
              assetToBeSent: sendAsset,
              amountToBeSent: Number(sendAmount.replace(',', '')),
              assetToReceive: receiveAsset,
              amountToReceive: Number(receiveAmount.replace(',', '')),
            }}
            onTrade={handleTradeCompleted}
            onReject={handleGoBack}
          />
        );
      case Steps.Summary:
        return <Summary chain={chain} txid={txid} onNewTrade={handleGoBack} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={classes.wrapper}>
        <CircularProgress />
      </div>
    );
  }

  const { name, endpoint } = bestProvider.provider;
  return (
    <>
      <div className={classes.info}>
        <p className={classes.infoText}>
          {' '}
          {`Status: ${connected ? `Connected - Network: ${chain}` : `Not Connected`}`}
        </p>
      </div>
      <div className={classes.wrapper}>
        <TdexSteps steps={steps} activeStep={activeStep} />
        <div>{getStepContent()}</div>
      </div>
      <div className={classes.info}>
        <p className={classes.infoText}>
          Market provided by {` ${name} - ${endpoint}`}
        </p>
      </div>
    </>
  );
};

export default TdexSwapFlow;
