import { createStyles, Grid, Link, makeStyles, TextField, Tooltip, Typography } from '@material-ui/core';
import { ContractABIs } from 'boltz-core';
import { Contract, Signer } from 'ethers';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { boltzPairsMap } from '../../../../constants/boltzRates';
import { BoltzSwapResponse, ClaimDetails, StatusResponse, SwapUpdateEvent } from '../../../../constants/boltzSwap';
import CurrencyID from '../../../../constants/currency';
import { useBlockExplorers } from '../../../../context/NetworkContext';
import { SwapFlowProps } from '../../../../pages/home';
import { getETALabelWithSeconds } from '../../../../services/refund/timestamp';
import { getHexString } from '../../../../services/submarine/keys';
import { selectEthereumData } from '../../../../store/boltz-slice';
import { useAppSelector } from '../../../../store/hooks';
import { sendEthereumTransaction } from '../../../../utils/ethereumTransactionWrapper';
import { timeUntilExpiry } from '../../../../utils/invoiceDecoder';
import svgIcons from '../../../../utils/svgIcons';
import { formatTokenAmount } from '../../../../utils/tokenDecimalHelper';
import Button from '../../../Button';
import DrawQrCode from '../../../DrawQrCode';
import BoltzSwapStep from '../BoltzSwapStep';

type BoltzReverseSendProps = SwapFlowProps & {
  swapDetails?: BoltzSwapResponse;
  claimDetails?: ClaimDetails;
  swapStatus?: StatusResponse;
  signer?: Signer;
  proceedToNextEthereum: (claimTransactionId: string) => void;
};

const useStyles = makeStyles(() =>
  createStyles({
    qrCodeContainer: {
      marginTop: '1rem',
    },
    input: {
      borderRadius: 0,
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleIcon: {
      height: '1.5rem',
      marginLeft: '0.5rem',
    },
    buttonsContainer: {
      marginTop: '1rem',
    },
    link: {
      display: 'flex',
      alignItems: 'center',
    },
    linkIcon: {
      height: '1rem',
      marginLeft: '0.25rem',
    },
    expireContainer: {
      marginBottom: '1rem',
    },
  })
);

const BoltzReverseSend = (props: BoltzReverseSendProps): ReactElement => {
  const {
    signer,
    swapStatus,
    swapDetails,
    claimDetails,
    sendAsset,
    receiveAsset,
    proceedToNextEthereum,
  } = props;

  const classes = useStyles();
  const explorers = useBlockExplorers();

  const ethereumData = useAppSelector(selectEthereumData);
  const [etaTimeDiffLabel, setEtaTimeDiffLabel] = useState('');
  const [mainButtonDisabled, setMainButtonDisabled] = useState(true);
  const [onMainButtonClick, setOnMainButtonClick] = useState<(() => void) | undefined>(undefined);
  const [etaLeft, setETALeft] = useState(timeUntilExpiry(swapDetails?.invoice));

  const explorer = useMemo(
    () => {
      const explorer = explorers.get(boltzPairsMap(receiveAsset));

      if (explorer) {
        return explorer;
      } else {
        return explorers.get(boltzPairsMap(CurrencyID.ETH));
      }
    },
    [receiveAsset, explorers],
  );

  const blockExplorerLink = `${explorer!.address}${swapDetails?.lockupAddress}`;

  const mainButtonText = useMemo(() => {
    if (receiveAsset !== CurrencyID.BTC && receiveAsset !== CurrencyID.LTC) {
      if (swapStatus && swapStatus.status === SwapUpdateEvent.TransactionConfirmed) {
        const claimFunction = async () => {
          setMainButtonDisabled(true);
          try {
            let transactionId: string;
            if (receiveAsset === CurrencyID.ETH) {
              const etherSwap = new Contract(
                ethereumData.swapContracts.EtherSwap,
                ContractABIs.EtherSwap,
              );

              transactionId = (await sendEthereumTransaction(
                signer!,
                await etherSwap.populateTransaction.claim(
                  `0x${getHexString(claimDetails!.preImage)}`,
                  formatTokenAmount(18, swapDetails!.onchainAmount!),
                  swapDetails!.refundAddress!,
                  swapDetails!.timeoutBlockHeight,
                ),
              )).hash;
            } else {
              const erc20Swap = new Contract(
                ethereumData.swapContracts.ERC20Swap,
                ContractABIs.ERC20Swap,
              );

              const tokenContract = new Contract(
                ethereumData.tokens[boltzPairsMap(receiveAsset)],
                ContractABIs.ERC20,
              ).connect(signer!);

              const tokenDecimals = await tokenContract.decimals();

              transactionId = (await sendEthereumTransaction(
                signer!,
                await erc20Swap.populateTransaction.claim(
                  `0x${getHexString(claimDetails!.preImage)}`,
                  formatTokenAmount(tokenDecimals, swapDetails!.onchainAmount!),
                  tokenContract.address,
                  swapDetails!.refundAddress!,
                  swapDetails!.timeoutBlockHeight,
                ),
              )).hash;
            }

            proceedToNextEthereum(transactionId);
          } catch {
            setMainButtonDisabled(false);
          }
        };

        setOnMainButtonClick(() => claimFunction);
        setMainButtonDisabled(false);
        return 'Claim';
      }
    }

    return !!swapStatus && swapStatus.status === SwapUpdateEvent.TransactionMempool
      ? 'Waiting for one confirmation'
      : 'Waiting for transaction';
  }, [swapDetails, ethereumData, swapStatus, claimDetails, receiveAsset, proceedToNextEthereum, signer]);

  useEffect(() => {
    setEtaTimeDiffLabel(getETALabelWithSeconds(etaLeft).label);

    if (etaLeft) {
      const sub = setTimeout(() => {
        setETALeft(etaLeft - 1);
      }, 1000);

      return () => clearTimeout(sub);
    }
  }, [etaLeft]);

  const eta = etaLeft ? `Expires in ${etaTimeDiffLabel}` : 'Expired!';

  return (
    <BoltzSwapStep
      title={<span className={classes.titleContainer}>
        Pay this {sendAsset} invoice
        <Tooltip
          title='A lightning invoice is how you receive payments on the lightning network. Please use a lightning wallet to pay the invoice.'
        >
          <img
            className={classes.titleIcon}
            src={svgIcons.questionIcon}
            alt='hint'
          />
        </Tooltip>
      </span>}
      content={<>
        <Typography variant='body1' className={classes.expireContainer}>
          {eta}
        </Typography>
        <TextField
          fullWidth
          variant='outlined'
          multiline
          disabled
          value={swapDetails!.invoice}
          InputProps={{
            className: classes.input,
          }}
        />
        <Grid
          item
          container
          justify='space-between'
          className={classes.buttonsContainer}
        >
          <Link
            href={blockExplorerLink}
            target='_blank'
            rel='noopener noreferrer'
            className={classes.link}
          >
            Check the lockup
            <Tooltip title='Check the address to which Boltz will lockup coins after the invoice is paid.'>
              <img
                className={classes.linkIcon}
                src={svgIcons.questionIcon}
                alt='hint'
              />
            </Tooltip>
          </Link>
          <Button
            variant='contained'
            onClick={() => navigator.clipboard?.writeText(swapDetails!.invoice!)}
          >
            Copy Invoice
          </Button>
        </Grid>
        <Grid
          item
          container
          justify='center'
          className={classes.qrCodeContainer}
        >
          <DrawQrCode size={200} link={swapDetails!.invoice} />
        </Grid>
      </>}
      mainButtonVisible
      mainButtonDisabled={mainButtonDisabled}
      onMainButtonClick={onMainButtonClick}
      mainButtonText={mainButtonText}
    />
  );
};

export default BoltzReverseSend;
