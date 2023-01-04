import { useEffect, useState } from 'react';
import { RatesFetcher } from './rates';
import ExampleFetcherWithInitalizer from './ratesExample';

export default function useExampleHook(): RatesFetcher | null {
  let [fetcher, setFetcher] = useState<RatesFetcher | null>(null);

  useEffect(() => {
    (async () => {
      // start a new Example rates fetcher
      // This is an example of stateful implementation with async
      // instantiation using the The Functional Options Pattern
      // https://betterprogramming.pub/how-to-write-an-async-class-constructor-in-typescript-javascript-7d7e8325c35e

      const tdexFetcher = new ExampleFetcherWithInitalizer(
        await ExampleFetcherWithInitalizer.WithoutInterval(),
      );
      setFetcher(tdexFetcher);

      // here we should instantiate all other fetchers
      // const comitFetcher = ...
      // const boltzFetcher = ...

      // Clean up
      return () => {
        tdexFetcher.clean();
        // we should clean the other fetchers as well
      };
    })();
  }, []);

  return fetcher;
}
