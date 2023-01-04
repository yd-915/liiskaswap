import { PopulatedTransaction, Signer } from 'ethers';

export const sendEthereumTransaction = async (
  signer: Signer,
  populatedTransaction: PopulatedTransaction,
) => {
  try {
    const gasEstimate = await signer.provider!.estimateGas(
      {
        ...populatedTransaction,
        from: await signer.getAddress(),
      },
    );

    return await signer.sendTransaction({
      ...populatedTransaction,
      gasLimit: gasEstimate.add(gasEstimate.div(5)),
    });
  } catch (error) {
    if (error.data && error.data.message) {
      throw error.data.message;
    } else if (error.message) {
      throw error.message;
    } else {
      throw error;
    }
  }
};
