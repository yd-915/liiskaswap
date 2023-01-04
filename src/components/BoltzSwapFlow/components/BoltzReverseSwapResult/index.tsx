import { Link } from '@material-ui/core';
import { ReactElement, useMemo } from 'react';
import { useHistory } from 'react-router';
import { boltzPairsMap } from '../../../../constants/boltzRates';
import CurrencyID from '../../../../constants/currency';
import { useBlockExplorers } from '../../../../context/NetworkContext';
import { ROUTES } from '../../../../pages/home';
import BoltzSwapResult from '../BoltzSwapResult';
import BoltzSwapStep from '../BoltzSwapStep';

type BoltzReverseSwapResultProps = {
  errorMessage?: string;
  transactionId?: string;
  receiveAsset: CurrencyID;
};

const BoltzReverseSwapResult = (
  props: BoltzReverseSwapResultProps,
): ReactElement => {
  const { errorMessage, transactionId, receiveAsset } = props;
  let history = useHistory();
  const explorers = useBlockExplorers();
  const mapAssetToChain = (receiveAsset: CurrencyID) => {
    switch (receiveAsset) {
      case CurrencyID.BTC:
      case CurrencyID.LTC:
      case CurrencyID.ETH:
        return receiveAsset;
      case CurrencyID.ETH_USDT:
        return CurrencyID.ETH;
      default:
        throw new Error(`unable to map ${receiveAsset} to chain`);
    }
  };

  const explorer = useMemo(
    () => explorers.get(boltzPairsMap(mapAssetToChain(receiveAsset))),
    [receiveAsset, explorers],
  );

  const blockExplorerLink = `${explorer!.transaction}${transactionId}`;

  return (
    <BoltzSwapStep
      title=''
      content={<>
        <BoltzSwapResult errorMessage={errorMessage} />
        {!errorMessage && (
          <Link
            href={blockExplorerLink}
            target='_blank'
            rel='noopener noreferrer'
          >
            See on block explorer
          </Link>
        )}
      </>}
      mainButtonVisible={!errorMessage}
      mainButtonText={'Swap again'}
      onMainButtonClick={() => {
        history.replace(ROUTES.HOME);
      }}
    />
  );
};

export default BoltzReverseSwapResult;
