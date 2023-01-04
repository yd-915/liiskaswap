import { createStyles, Grid, makeStyles } from '@material-ui/core';
import jazzicon from '@metamask/jazzicon';
import axios from 'axios';
import { providers, Signer } from 'ethers';
import React, { ReactElement, useEffect, useState } from 'react';
import { useCallback } from 'react';
import Web3Modal from 'web3modal';
import { BOLTZ_GET_CONTRACTS_API_URL } from '../../../api/boltzApiUrls';
import { useBoltzConfiguration } from '../../../context/NetworkContext';
import { selectEthereumData, setEthereumData } from '../../../store/boltz-slice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { createWeb3Modal } from '../../../utils/web3modal';
import Button from '../../Button';

const useStyles = makeStyles(() =>
  createStyles({
    buttonsContainer: {
      marginTop: '1rem',
    },
  })
);

const removeChildren = (parent: HTMLElement) => {
  while (parent.lastChild) {
    parent.removeChild(parent.lastChild);
  }
};

const Identicon = (props: { address: string }) => {
  return (
    <div
      id={'jazzicon'}
      ref={ref => {
        if (ref !== null) {
          removeChildren(ref);
          ref.appendChild(
            jazzicon(40, parseInt(props.address.slice(2, 10), 16)),
          );
        }
      }}
    />
  );
};

const BoltzEthereumAccount = (props: {
  setError: React.Dispatch<React.SetStateAction<string>>;
  setSigner: React.Dispatch<React.SetStateAction<Signer | undefined>>;
  setWrongChain: (value: boolean) => void;
  additionalButton?: ReactElement;
}) => {
  const { setError, setSigner, setWrongChain } = props;

  const dispatch = useAppDispatch();
  const ethereumData = useAppSelector(selectEthereumData);

  const { apiEndpoint, infuraId } = useBoltzConfiguration();

  const [provider, setProvider] = useState<any>(undefined);
  const [web3Modal, setWeb3Modal] = useState<Web3Modal | undefined>(undefined);

  const [signerAddress, setSignerAddress] = useState<string | undefined>(undefined);

  const classes = useStyles();

  useEffect(() => {
    (async () => {
      const ethereumData = (
        await axios.get(BOLTZ_GET_CONTRACTS_API_URL(apiEndpoint))
      ).data.ethereum;
      dispatch(setEthereumData(ethereumData));

      const web3Modal = await createWeb3Modal(
        ethereumData.network.name,
        infuraId,
      );

      if (web3Modal.cachedProvider) {
        const web3modalProvider = await web3Modal.connect();
        setProvider(web3modalProvider);

        const ethersProvider = new providers.Web3Provider(web3modalProvider);
        const signer = ethersProvider.getSigner();

        setSignerAddress(await signer.getAddress());
        setSigner(signer);
      }

      setWeb3Modal(web3Modal);
    })();
  }, [infuraId, apiEndpoint, dispatch, setSigner]);

  const setNetworkError = useCallback(() => {
    const wantedNetwork = ethereumData.network.name
      || `with id ${ethereumData.network.chainId}`;
    setError(`Ethereum wallet is not on network ${wantedNetwork}`);
    setWrongChain(true);
  }, [ethereumData, setError, setWrongChain]);

  useEffect(() => {
    if (!provider) {
      return;
    }

    provider.on('accountsChanged', async (accounts: string[]) => {
      if (accounts.length > 0) {
        const ethersProvider = new providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();

        setSignerAddress(await signer.getAddress());
        setSigner(signer);
      } else {
        setSignerAddress(undefined);
        setSigner(undefined);
      }
    });

    provider.on('chainChanged', async () => {
      const ethersProvider = new providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const signerChainId = await signer.getChainId();
      if (signerChainId === ethereumData.network.chainId) {
        setError('');
        setWrongChain(false);
      } else {
        setNetworkError();
      }
    });

    return () => {
      provider.removeAllListeners();
    };
  }, [provider, ethereumData, setSigner, setError, setNetworkError, setWrongChain]);

  const showWeb3Modal = async () => {
    try {
      setError('');
      setWrongChain(false);
      setSigner(undefined);
      setSignerAddress(undefined);
      web3Modal!.clearCachedProvider();

      const web3modalProvider = await web3Modal!.connect();
      const ethersProvider = new providers.Web3Provider(web3modalProvider);

      setProvider(web3modalProvider);
      const signer = ethersProvider.getSigner();

      if ((await signer.getChainId()) === ethereumData.network.chainId) {
        setSignerAddress(await signer.getAddress());
        setSigner(signer);
      } else {
        setNetworkError();
      }
    } catch (e) {} // life is short, yolo
  };

  return (
    <>
      {signerAddress === undefined
        ? (
          <div>
            {!!web3Modal && (
              <Button
                variant='outlined'
                color='primary'
                onClick={showWeb3Modal}
              >
                Connect Ethereum wallet
              </Button>
            )}
          </div>
        )
        : (
          <Grid
            item
            container
            justify='center'
            alignItems='center'
            direction='column'
          >
            {
              // TODO: monospace signer address?
              // TODO: only show first 6 and last 4 digits of signer? (easier to double check address?)
            }
            <Grid
              item
              container
              justify='center'
              alignItems='center'
              spacing={1}
            >
              <Grid item>
                <Identicon address={signerAddress!} />
              </Grid>
              <Grid item>Connected to {signerAddress}</Grid>
            </Grid>

            <Grid item container justify='center' spacing={1} className={classes.buttonsContainer}>
              {!!props.additionalButton && <Grid item>{props.additionalButton}</Grid>}
              <Grid item>
                <Button
                  color='primary'
                  variant='outlined'
                  onClick={showWeb3Modal}
                >
                  Change
                </Button>
              </Grid>
            </Grid>
          </Grid>
        )}
    </>
  );
};

export default BoltzEthereumAccount;
