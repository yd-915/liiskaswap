import { BOLTZ_STREAM_SWAP_STATUS_API_URL } from '../api/boltzApiUrls';
import { StatusResponse, swapSteps, SwapUpdateEvent } from '../constants/boltzSwap';

export const startListening = (
  swapId: string,
  apiEndpoint: string,
  onMessage: (data: StatusResponse, stream: EventSource) => void,
) => {
  const stream = new EventSource(
    `${BOLTZ_STREAM_SWAP_STATUS_API_URL(apiEndpoint)}?id=${swapId}`,
  );
  stream.onmessage = function(event) {
    const data: StatusResponse = JSON.parse(event.data);
    onMessage(data, stream);
  };
  stream.onerror = event => {
    console.log('error:', event);
    stream?.close();
    setTimeout(() => startListening(swapId, apiEndpoint, onMessage), 2000);
  };
};

export const swapError = (status: StatusResponse): string => {
  if (
    swapSteps
      .map(step => step.status)
      .concat([SwapUpdateEvent.InvoiceSet])
      .some(step => step.includes(status.status))
  ) {
    return '';
  }
  if (status.status === SwapUpdateEvent.InvoiceFailedToPay) {
    return 'Failed to pay the invoice. Please refund your coins.';
  }
  if (status.status === SwapUpdateEvent.TransactionLockupFailed) {
    return 'Deposited amount is insufficient. Please refund your coins.';
  }
  if (status.status === SwapUpdateEvent.SwapExpired) {
    return 'Swap expired. Please refund your coins if you transferred any to the provided address.';
  }
  return status.failureReason || 'Error: Unknown status';
};

export const isFinal = (
  status: StatusResponse,
  reverse: boolean = false,
  instant: boolean = false,
): boolean => {
  if (!reverse) {
    return (
      SwapUpdateEvent.TransactionClaimed === status.status
      || !!status.failureReason
    );
  }
  return (
    (instant && SwapUpdateEvent.TransactionMempool === status.status)
    || [
      SwapUpdateEvent.TransactionConfirmed,
      SwapUpdateEvent.SwapExpired,
      SwapUpdateEvent.TransactionRefunded,
      SwapUpdateEvent.TransactionFailed,
    ].includes(status.status)
  );
};
