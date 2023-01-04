import { createStyles, FormControlLabel, Grid, makeStyles, Switch, TextField, Tooltip } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { crypto } from 'bitcoinjs-lib';
import { Signer } from 'ethers';
import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { BOLTZ_CREATE_SWAP_API_URL } from '../../../../api/boltzApiUrls';
import useBoltzFetcher from '../../../../constants/boltzFetcherHook';
import { BoltzSwapResponse, ClaimDetails } from '../../../../constants/boltzSwap';
import CurrencyID from '../../../../constants/currency';
import { useBoltzConfiguration } from '../../../../context/NetworkContext';
import { SwapFlowProps } from '../../../../pages/home';
import { isAddressValid } from '../../../../services/reverse/addressValidation';
import { generateKeys, getHexString } from '../../../../services/submarine/keys';
import { randomBytes } from '../../../../services/submarine/randomBytes';
import svgIcons from '../../../../utils/svgIcons';
import BoltzEthereumAccount from '../BoltzEthereumAccount';
import BoltzSwapStep from '../BoltzSwapStep';

type BoltzReverseDestinationProps = SwapFlowProps & {
  proceedToNext: (
    swapDetails: BoltzSwapResponse,
    claimDetails: ClaimDetails,
    signer?: Signer,
  ) => void;
};

const useStyles = makeStyles(() =>
  createStyles({
    input: {
      borderRadius: 0,
      alignItems: 'start',
    },
    instant: {
      marginTop: '1rem',
      '& .MuiFormControlLabel-label': {
        display: 'flex',
        alignItems: 'center',
      },
    },
    instantHint: {
      height: '1.25rem',
      marginLeft: '0.5rem',
    },
  })
);

const BoltzReverseDestination = (
  props: BoltzReverseDestinationProps,
): ReactElement => {
  const { sendAsset, receiveAsset, sendAmount, proceedToNext } = props;
  const classes = useStyles();
  const { apiEndpoint, bitcoinConstants, litecoinConstants } = useBoltzConfiguration();
  const boltzRates = useBoltzFetcher();
  const [address, setAddrerss] = useState('');
  const [instant, setInstant] = useState(true);
  const [wrongChain, setWrongChain] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signer, setSigner] = useState<Signer | undefined>(undefined);
  const [keys, setKeys] = useState<{ publicKey?: string; privateKey?: string }>(
    {},
  );
  const network = useMemo(
    () =>
      receiveAsset === CurrencyID.BTC
        ? bitcoinConstants
        : litecoinConstants,
    [bitcoinConstants, litecoinConstants, receiveAsset],
  );

  const isUtxoChain = receiveAsset === CurrencyID.BTC || receiveAsset === CurrencyID.LTC;

  const placeholder = `${receiveAsset} receiving address`;

  useEffect(() => {
    if (isUtxoChain) {
      setKeys(generateKeys(network));
    }
  }, [network, isUtxoChain]);

  const createSwap = async () => {
    const formattedPairs = await boltzRates!.formatPair([
      sendAsset,
      receiveAsset,
    ]);
    const preImage = randomBytes(32);
    const params = {
      ...formattedPairs,
      type: 'reverseSubmarine',
      claimPublicKey: keys.publicKey,
      preimageHash: getHexString(crypto.sha256(preImage)),
      invoiceAmount: new BigNumber(sendAmount).multipliedBy(10 ** 8).toNumber(),
      claimAddress: signer !== undefined ? await signer.getAddress() : undefined,
    };

    const claimDetails: ClaimDetails = {
      preImage: preImage,
      address: address,
      instantSwap: instant,
      privateKey: keys.privateKey,
    };

    const errorMessage = 'Something went wrong. Please try again.';
    setLoading(true);

    try {
      const response = await fetch(BOLTZ_CREATE_SWAP_API_URL(apiEndpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(params),
      });

      const data: BoltzSwapResponse = await response.json();
      setLoading(false);

      if (response.status === 201) {
        setError('');
        proceedToNext(data, claimDetails, signer);
      } else {
        const message = data.error || errorMessage;
        setError(message);
      }
    } catch (_) {
      setError(errorMessage);
      setLoading(false);
    }
  };

  const addressInvalid = !!address && !isAddressValid(address, network);

  return receiveAsset === CurrencyID.BTC || receiveAsset === CurrencyID.LTC
    ? (
      <BoltzSwapStep
        title={<>
          Paste a {receiveAsset} address you'd like to receive the funds on
        </>}
        content={<Grid item container justify='center'>
          <TextField
            multiline
            fullWidth
            variant='outlined'
            aria-label={'receive-address'}
            rows={3}
            placeholder={placeholder}
            value={address}
            onChange={e => {
              setAddrerss(e.target.value);
              setError('');
            }}
            InputProps={{
              className: classes.input,
            }}
            error={addressInvalid}
            helperText={addressInvalid && 'Invalid address'}
          />
          <FormControlLabel
            control={<Switch
              checked={instant}
              onChange={() => setInstant(oldValue => !oldValue)}
              name='instantSwap'
              color='primary'
            />}
            className={classes.instant}
            label={<>
              Swap instantly
              <Tooltip
                title='Enabling swap instantly means you agree to accept a 0-conf transaction from Boltz, which results in an instant swap.'
              >
                <img
                  className={classes.instantHint}
                  src={svgIcons.questionIcon}
                  alt='hint'
                />
              </Tooltip>
            </>}
          />
        </Grid>}
        errorMessage={error}
        mainButtonText='Next'
        mainButtonVisible
        onMainButtonClick={createSwap}
        mainButtonDisabled={!address || !isAddressValid(address, network)}
        mainButtonLoading={loading}
      />
    )
    : (
      <BoltzSwapStep
        title={<>
          Connect an Ethereum wallet with which you'd like to swap {receiveAsset}
        </>}
        content={<BoltzEthereumAccount
          setWrongChain={setWrongChain}
          setError={setError}
          setSigner={setSigner}
        />}
        errorMessage={error}
        mainButtonText='Next'
        mainButtonVisible
        onMainButtonClick={createSwap}
        mainButtonDisabled={signer === undefined || wrongChain}
        mainButtonLoading={loading}
      />
    );
};

export default BoltzReverseDestination;
