import { ContractABIs } from 'boltz-core';
import { Contract, utils } from 'ethers';

// Six hours are 1440 Ethereum blocks
const sixHoursBlocks = 1440;

let abortQuerying = false;

export const CurrencyTypes = {
  Ether: 'Ether',
  ERC20: 'ERC20',
  Lightning: 'Lightning',
  BitcoinLike: 'BitcoinLike',
};

const handleFilterResults = async (
  appendToSwapIds,
  type,
  contract,
  signerAddress,
  filterResults,
) => {
  for (const swap of filterResults) {
    // The filter should already exclude all events that are not lockups, but to make sure
    // we double check this here (caused issues on regtest for some reason)
    if (swap.event !== 'Lockup') {
      continue;
    }

    // TODO: why do event filters not work?
    if (swap.args.refundAddress !== signerAddress) {
      continue;
    }

    const valueHashTypes = type === CurrencyTypes.Ether
      ? ['bytes32', 'uint', 'address', 'address', 'uint']
      : ['bytes32', 'uint', 'address', 'address', 'address', 'uint'];

    const valueHash = utils.solidityKeccak256(valueHashTypes, swap.args);
    const isStillLocked = await contract.swaps(valueHash);

    if (isStillLocked) {
      const blockOfSwap = await contract.provider.getBlock(swap.blockHash);
      const swapDate = new Date(blockOfSwap.timestamp * 1000);

      appendToSwapIds({
        type,
        contract,
        date: swapDate,
        id: `${swap.transactionHash.substring(0, 6)}...`,
        data: swap.args,
      });
    }
  }
};

const queryFilter = async (appendToSwapIds, type, contract, signerAddress, filter) => {
  let scanToBlock = await contract.provider.getBlockNumber();

  while (scanToBlock > 1) {
    if (abortQuerying) {
      return;
    }

    if (scanToBlock - sixHoursBlocks < 1) {
      handleFilterResults(
        appendToSwapIds,
        type,
        contract,
        signerAddress,
        await contract.queryFilter(filter, 0, scanToBlock),
      );
      return;
    }

    handleFilterResults(
      appendToSwapIds,
      type,
      contract,
      signerAddress,
      await contract.queryFilter(
        filter,
        scanToBlock - sixHoursBlocks,
        scanToBlock,
      ),
    );

    scanToBlock -= sixHoursBlocks + 1;
  }
};

// TODO: support for ether
// TODO: stop when refund for a swap is initiated
export const queryEthereumSwaps = (signer, contracts, appendToSwapIds) => {
  abortQuerying = false;

  const { swapContracts } = contracts.ethereum;

  new Promise(async () => {
    const signerAddress = await signer.getAddress();

    const etherSwap = new Contract(
      swapContracts.EtherSwap,
      ContractABIs.EtherSwap,
      signer,
    );
    const erc20Swap = new Contract(
      swapContracts.ERC20Swap,
      ContractABIs.ERC20Swap,
      signer,
    );

    const etherFilter = await etherSwap.queryFilter(
      etherSwap.filters.Lockup(null, null, null, signerAddress, null),
    );
    const erc20Filter = await erc20Swap.queryFilter(
      erc20Swap.filters.Lockup(null, null, null, null, signerAddress, null),
    );

    queryFilter(appendToSwapIds, CurrencyTypes.Ether, etherSwap, signerAddress, etherFilter);
    queryFilter(appendToSwapIds, CurrencyTypes.ERC20, erc20Swap, signerAddress, erc20Filter);
  });

  return () => (abortQuerying = true);
};
