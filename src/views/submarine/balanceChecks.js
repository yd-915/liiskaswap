import { ContractABIs } from 'boltz-core';
import { Contract } from 'ethers';
import { normalizeTokenAmount } from '../../utils/ethereumDecimals';

const decimals = 10 ** 8;

/**
 * Checks whether the signer has enough Ether for the Swap
 *
 * @param {*} signer
 * @param {number} expectedBalance how much the the signer is expected to have
 */
export const checkEtherBalance = async (signer, expectedBalance) => {
  const normalizedExpectedBalance = expectedBalance * decimals;

  const signerBalance = await signer.provider.getBalance(
    await signer.getAddress(),
  );
  const normalizedBalance = normalizeTokenAmount(signerBalance, 18);

  return normalizedExpectedBalance < normalizedBalance;
};

/**
 * Checks whether the signer has token balance for the Swap
 *
 * @param {*} signer
 * @param {string} contractAddress address of the ERC20 token contract
 * @param {number} expectedBalance how much the the signer is expected to have
 */
export const checkTokenBalance = async (
  signer,
  contractAddress,
  expectedBalance,
) => {
  const normalizedExpectedBalance = expectedBalance * decimals;

  const contract = new Contract(contractAddress, ContractABIs.ERC20, signer);

  const [signerBalance, tokenDecimals] = await Promise.all([
    await contract.balanceOf(await signer.getAddress()),
    await contract.decimals(),
  ]);

  const normalizedBalance = normalizeTokenAmount(signerBalance, tokenDecimals);

  return normalizedExpectedBalance < normalizedBalance;
};
