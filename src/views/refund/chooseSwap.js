import { Button, Divider, Typography } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GET_CONTRACTS } from '../../api/apiUrls';
import DropZone from '../../components/dropzone';
import Popover from '../../components/Popover';
import blockTimes from '../../constants/blockTimes';
import { CurrencyTypes } from '../../constants/submarine';
import { setSigner } from '../../services/ethereum/ethereumDuck';
import { selectSigner } from '../../services/ethereum/ethereumSelectors';
import {
  checkStatus,
  refundFileUploadHandler,
  setEta,
  setID as setSwapID,
  setRefundFile as setRefundDetails,
} from '../../services/refund/refundDuck';
import { selectFileDetails, selectFileStatus } from '../../services/refund/refundSelectors';
import { fetchedContracts } from '../../services/submarine/submarineDuck';
import { selectContracts } from '../../services/submarine/submarineSelectors';
import svgIcons from '../../utils/svgIcons';
import { connectWeb3Modal } from '../../utils/web3modal';
import { queryEthereumSwaps } from './ethereumFetcher';

let abortQueryingEthereumSwaps;

const ChooseSwap = props => {
  const { handleNextStep } = props;
  const isDrawerClosed = props.isDrawerClosed;

  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const [id, setId] = useState('');
  const [swapIDs, setSwapIDs] = useState([]);
  const [recentSwapsAnchorEl, setRecentSwapsAnchorEl] = useState(null);

  const signer = useSelector(selectSigner);
  const refundFile = useSelector(selectFileDetails);
  const fileUploaded = useSelector(selectFileStatus);
  const contractAddresses = useSelector(selectContracts);

  const recentSwapsOpen = Boolean(recentSwapsAnchorEl);

  const idSelectionHandler = id =>
    () => {
      setId(id);
      dispatch(setSwapID(id));
    };

  useEffect(() => {
    if (isDrawerClosed) {
      idSelectionHandler('')();
    }
  });

  useEffect(() => {
    setSwapIDs(JSON.parse(localStorage.getItem('swapIds') || '[]'));

    // Query for refundable swaps on the Ethereum chain if an Ethereum signer is availble
    if (signer !== undefined) {
      abortQueryingEthereumSwaps = queryEthereumSwaps(
        signer,
        contractAddresses,
        ethereumSwapID => {
          setSwapIDs(existingSwapIDs => existingSwapIDs.concat(ethereumSwapID));
        },
      );
    }
  }, [signer, contractAddresses, setSwapIDs]);

  const handleRecentSwapsPopoverOpen = event => {
    setRecentSwapsAnchorEl(event.currentTarget);
  };

  const handleRecentSwapsPopoverClose = () => {
    setRecentSwapsAnchorEl(null);
  };

  const nextStepHandler = () => {
    if (abortQueryingEthereumSwaps) {
      abortQueryingEthereumSwaps();
    }

    if (id) {
      const swapDetails = swapIDs.filter(({ id: swapID }) => id === swapID)[0];
      dispatch(setRefundDetails(swapDetails));

      // Ethereum refunds have no refund files, which means that we can have this logic in here
      if (
        swapDetails.type === CurrencyTypes.Ether
        || swapDetails.type === CurrencyTypes.ERC20
      ) {
        signer.provider.getBlockNumber().then(blockNumber => {
          const timelock = swapDetails.data.timelock.toNumber();

          if (timelock > blockNumber) {
            const timeoutDeltaSeconds = (timelock - blockNumber) * blockTimes.Ethereum;
            dispatch(setEta(new Date().getTime() / 1000 + timeoutDeltaSeconds));
          }

          handleNextStep();
        });
        return;
      }
    }

    checkStatus(id || refundFile.id, dispatch, handleNextStep);
  };

  const renderHeader = () => (
    <Typography
      variant='div'
      component='h2'
      align='center'
      className='refund__choose-swap-header'
    >
      Check status or initiate refund of your coins
      <Typography variant='div' align='center' className='sub-heading'>
        If your on-chain to lightning swap didn't succeed for some reason, please upload the refund file you downloaded
        to check status and start the refunding process.
      </Typography>
    </Typography>
  );

  const setRefundFile = file => {
    refundFileUploadHandler(file, dispatch);
    idSelectionHandler('')();
  };

  const uploadFile = () => {
    inputRef.current.click();
  };

  const diff_minutes = (dt2, dt1) => {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
  };

  const isFileUploaded = !!fileUploaded && !id;

  const renderSwapFields = () => (
    <div className='refund__choose-swap-fields'>
      <div className='recent-swaps'>
        <Typography variant='div' className='field-heading'>
          Choose from recent Swaps
          <img
            src={svgIcons.questionIcon}
            alt='question-icon'
            className='question-icon'
            onMouseEnter={handleRecentSwapsPopoverOpen}
            onMouseLeave={handleRecentSwapsPopoverClose}
          />
        </Typography>
        {!swapIDs?.length && (
          <span className={'info'}>No recent swaps found...</span>
        )}
        {!!swapIDs?.length && (
          <ul className='list'>
            {swapIDs.map(({ id: swapID, date }) => (
              <li>
                <Button
                  onClick={idSelectionHandler(swapID)}
                  className={`${id === swapID ? 'selected' : ''}`}
                >
                  <span>ID: {swapID}</span>
                  <span>
                    {diff_minutes(
                      new Date(),
                      typeof date === 'string' ? new Date(date) : date,
                    )} min ago
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className='file-upload'>
        <Typography variant='div' className='field-heading'>
          Or upload refund file
        </Typography>
        <div
          className={`upload-container ${isFileUploaded ? 'uploaded' : ''}`}
          onClick={uploadFile}
        >
          <DropZone onFileRead={setRefundFile}>
            {isFileUploaded && (
              <React.Fragment>
                <span className={'uploaded'}>
                  <img src={svgIcons.greenTick} alt='' />
                </span>
                <p>File uploaded successfully!</p>
                <p>Drag and drop or click to upload another image</p>
              </React.Fragment>
            )}
            {!isFileUploaded && (
              <React.Fragment>
                <span className={'plus-icon'}>+</span>
                <p>Drag and drop or click to upload image</p>
              </React.Fragment>
            )}
            <input
              ref={inputRef}
              onChange={event => {
                setRefundFile(event.target.files[0]);
              }}
              type='file'
              accept={'image/png, application/json'}
            />
          </DropZone>
        </div>
      </div>
    </div>
  );

  return (
    <div className='refund__choose-swap'>
      {renderHeader()}
      {renderSwapFields()}
      <div className='refund__choose-swap-footer'>
        <Divider />
        <Button
          variant='contained'
          color='primary'
          onClick={async () => {
            let network;

            if (
              contractAddresses !== undefined
              && contractAddresses.ethereum !== undefined
              && contractAddresses.ethereum.network !== undefined
            ) {
              network = contractAddresses.ethereum.network;
            } else {
              const queriedContracts = await (
                await fetch(GET_CONTRACTS)
              ).json();
              network = queriedContracts.ethereum.network;
              dispatch(fetchedContracts(queriedContracts));
            }

            dispatch(setSigner(await connectWeb3Modal(network)));
          }}
          className='connect-wallet-button'
          disabled={signer !== undefined}
        >
          Connect wallet
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={nextStepHandler}
          className='next-step-button'
          disabled={!id && !refundFile?.id}
        >
          Check status
        </Button>
      </div>
      <Popover
        id='recent-swaps-popover'
        open={recentSwapsOpen}
        anchorEl={recentSwapsAnchorEl}
        onCloseHandler={handleRecentSwapsPopoverClose}
        text='These are the refund files that are stored in the browser. Clearing your browser cache would result in the deletion of these files.'
      />
    </div>
  );
};

export default ChooseSwap;
