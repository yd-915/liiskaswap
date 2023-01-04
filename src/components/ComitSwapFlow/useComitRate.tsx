import { useCallback, useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useNetwork } from '../../context/NetworkContext';
import { fromKrakenPriceToQuote, Quote } from './Asb';
import { BitcoinAmount } from './BitcoinAmount';
import { XmrBtcRateFetcher } from './XmrBtcRateFetcher';

const KRAKEN_WS = 'wss://ws.kraken.com';

export default function useComitRate(): {
  rateFetcher: XmrBtcRateFetcher | null;
  latestQuote: Quote | null;
  error: Error | null;
} {
  let [quote, setQuote] = useState<{
    quote: Quote | null;
    error: Error | null;
  }>({ quote: null, error: null });

  let [xmrBtcRateFetcher, setXmrBtcRateFetcher] = useState<XmrBtcRateFetcher | null>(null);

  let [latestKrakenPrice, setLatestKrakenPrice] = useState<{
    price: BitcoinAmount | null;
    error: Error | null;
  }>({ price: null, error: null });

  const { network } = useNetwork();

  const { sendMessage, lastJsonMessage, readyState } = useWebSocket(KRAKEN_WS);

  if (!xmrBtcRateFetcher) {
    setXmrBtcRateFetcher(new XmrBtcRateFetcher(null, null));
  }

  let subscribeToXmrBtcTicker = useCallback(
    () =>
      sendMessage(
        '{"event": "subscribe", "pair": [ "XMR/XBT" ], "subscription": { "name": "ticker"}}',
      ),
    [sendMessage],
  );

  useEffect(() => {
    if (readyState === ReadyState.OPEN && lastJsonMessage) {
      if (lastJsonMessage.connectionID) {
        subscribeToXmrBtcTicker();
      }

      if (
        Array.isArray(lastJsonMessage)
        && lastJsonMessage[2] === 'ticker'
        && lastJsonMessage[1].a
        && Array.isArray(lastJsonMessage[1].a)
      ) {
        let ask = lastJsonMessage[1].a[0];
        let price = BitcoinAmount.fromBtc(ask);
        setLatestKrakenPrice({ price, error: null });
      }
    } else if (readyState === ReadyState.CONNECTING) {
      let error = new Error('Waiting for latest price...');
      setLatestKrakenPrice({ price: null, error });
    } else if (readyState === ReadyState.CLOSED) {
      let error = new Error('Failed to fetch latest price');
      setLatestKrakenPrice({ price: null, error });
    }
  }, [readyState, lastJsonMessage, subscribeToXmrBtcTicker]);

  useEffect(() => {
    if (latestKrakenPrice.price) {
      let quote = fromKrakenPriceToQuote(latestKrakenPrice.price, network);
      setQuote({
        quote: quote,
        error: null,
      });
      if (xmrBtcRateFetcher) {
        xmrBtcRateFetcher.updateQuote(quote);
      }
    } else if (latestKrakenPrice.error) {
      setQuote({
        quote: null,
        error: latestKrakenPrice.error,
      });
      if (xmrBtcRateFetcher) {
        xmrBtcRateFetcher.updateError(latestKrakenPrice.error);
      }
    }
  }, [latestKrakenPrice, network, xmrBtcRateFetcher]);

  return {
    rateFetcher: xmrBtcRateFetcher,
    latestQuote: quote.quote ? quote.quote : null,
    error: quote.error ? quote.error : null,
  };
}
