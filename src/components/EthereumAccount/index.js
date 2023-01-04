import { makeStyles } from '@material-ui/core/styles';
import { Button, CircularProgress, Divider } from '@material-ui/core';
import { BigNumber } from 'ethers';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { explorers } from '../../constants/environment';
import { selectSigner } from '../../services/ethereum/ethereumSelectors';
import { setEthereumPrepayMinerFee } from '../../services/reverse/reverseDuck';
import svgIcons from '../../utils/svgIcons';
import { checkEtherBalance } from '../../views/submarine/balanceChecks';
import Identicon from './Identicon';

const gasUsage = {
  EtherSwap: {
    lock: 46460,
    claim: 24924,
    refund: 23372,
  },
  ERC20Swap: {
    lock: 86980,
    claim: 24522,
    refund: 23724,
  },
};

// TODO: button to clear web3modal state
const EthereumAccount = props => {
  const dispatch = useDispatch();

  const signer = useSelector(selectSigner);

  // const utilsContext = useContext(UtilsContext);
  // const isMobileView = !!utilsContext?.isMobileView;

  const [error, setError] = useState(undefined);
  const [fetching, setFetching] = useState(true);

  const useStyles = makeStyles(() => ({
    ethereumWrapper: {
      marginTop: '50px',
      textAlign: 'center',
    },
    accountInfoWrapper: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '10px',
    },
    accountInfo: {
      display: 'flex',
      flexDirection: 'column',
      marginLeft: '15px',
    },
    accountValue: {
      fontSize: 20,
    },
    errorLabel: {
      margin: '50px 70px 20px',
      fontSize: '14px',
      color: '#F7931A',
    },
    ethereumFooter: {},
    viewOnEtherscanLink: {
      color: '#0095FF',
      display: 'flex',
      alignItems: 'center',
      paddingTop: '5px',
    },
    backButton: {
      padding: `17px`,
      borderRadius: `8px`,
      marginRight: `15px`,
      marginTop: `10px`,
    },
  }));

  const classes = useStyles();

  const {
    account,
    isEther,
    isReverseSwap,
    handleNextStep,
    etherSendAmount,
    handleBack,
  } = props;

  useEffect(() => {
    const gasCheck = async () => {
      const gasPrice = await signer.getGasPrice();

      let gasNeeded;

      if (isEther) {
        gasNeeded = isReverseSwap
          ? gasUsage.EtherSwap.claim
          : gasUsage.EtherSwap.lock;
      } else {
        gasNeeded = isReverseSwap
          ? gasUsage.ERC20Swap.claim
          : gasUsage.ERC20Swap.lock;
      }

      let etherNeeded = BigNumber.from(gasNeeded).mul(gasPrice).toNumber();

      if (isEther) {
        etherNeeded += etherSendAmount * 10 ** 18;
      }

      etherNeeded = etherNeeded / 10 ** 18;

      // Add a 100% percent buffer just to be sure
      etherNeeded = etherNeeded * 2;

      if (!(await checkEtherBalance(signer, etherNeeded))) {
        dispatch(setEthereumPrepayMinerFee(true));
        setError(true);
      }

      setFetching(false);
    };

    // TODO: is there a prettier way to do this? I don't like the dangling promise
    if (signer) {
      gasCheck();
    }
  }, [dispatch, signer, isEther, isReverseSwap, etherSendAmount]);

  return (
    <div className={classes.ethereumWrapper}>
      <div>Connected with Ethereum account</div>
      <div className={classes.accountInfoWrapper}>
        <Identicon account={account} />
        <div className={classes.accountInfo}>
          <span className={classes.accountValue}>
            {account.substring(0, 6)}...{account.slice(-4)}
          </span>
          <a
            className={classes.viewOnEtherscanLink}
            href={`${explorers.ethereum.address}${account}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <img src={svgIcons.externalLinkIcon} alt='external-link' />
            View on Etherscan
          </a>
        </div>
      </div>
      {error && (
        <div className={classes.errorLabel}>
          You do not have enough Ether to pay for the miner fee required claim the USDT of the Swap.
          <br />
          Therefore, we will show you a second invoice and after both are paid, the coins for the Swap will get locked
          and you will have some Ether in the wallet shown above.
        </div>
      )}
      <div className={classes.ethereumFooter}>
        <Divider />
        <Button
          className={classes.backButton}
          variant='outlined'
          onClick={handleBack}
        >
          <img src={svgIcons.leftArrow} alt='' />
        </Button>
        <Button
          disabled={fetching}
          variant='contained'
          color='primary'
          onClick={handleNextStep}
          className={`next-step-button ${fetching ? 'waiting button-with-spinner' : ''}`}
        >
          Confirm account
          {fetching && <CircularProgress />}
        </Button>
      </div>
    </div>
  );
};

EthereumAccount.propTypes = {
  account: PropTypes.string.isRequired,
  handleNextStep: PropTypes.func.isRequired,
  isReverseSwap: PropTypes.bool.isRequired,
  // Whether the onchain asset on Ethereum is Ether or not (= a token)
  isEther: PropTypes.bool.isRequired,
  // Only required if the Swap is from onchain Ether
  etherSendAmount: PropTypes.number,
};

export default EthereumAccount;
