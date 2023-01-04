import { useCallback, useEffect, useState } from 'react';
import { RatesFetcher } from '../../../constants/rates';
import TdexFetcher from './tdexFetcher';

import { useAppDispatch } from '../../../store/hooks';
import { setBestProvider } from '../../../store/tdex-slice';

export default function useTdexFetcher(): RatesFetcher | null {
  const dispatch = useAppDispatch();
  const stableDispatch = useCallback(dispatch, [dispatch]);
  let [fetcher, setFetcher] = useState<RatesFetcher | null>(null);

  useEffect(() => {
    (async () => {
      let liquidNetwork: 'liquid' | 'regtest' = 'regtest';
      let listOfProviders = [
        {
          name: 'development daemon',
          endpoint: 'http://localhost:9945',
        },
      ];

      if (process.env.NODE_ENV === 'production') {
        const result = await fetch(
          `https://raw.githubusercontent.com/TDex-network/tdex-registry/master/registry.json`,
        );
        listOfProviders = await result.json();
        liquidNetwork = 'liquid';
      }

      // async instantiation using the The Functional Options Pattern
      // https://betterprogramming.pub/how-to-write-an-async-class-constructor-in-typescript-javascript-7d7e8325c35e

      try {
        // start tdex fetcher  with the providers from tdex registry
        const tdexFetcher = new TdexFetcher(
          await TdexFetcher.WithTdexProviders(listOfProviders, liquidNetwork),
        );
        setFetcher(tdexFetcher);

        // we use browser events to dispatch redux action just before the previewGien* of the RatesFetcher returns
        window.addEventListener(
          'bestProvider',
          (evt: any) => {
            stableDispatch(setBestProvider((evt as CustomEvent).detail));
          },
          false,
        );
      } catch (e) {
        console.error(e);
        return;
      }
    })();
  }, [stableDispatch]);

  return fetcher;
}
