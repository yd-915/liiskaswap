import { useEffect, useState } from 'react';
import { BOLTZ_GET_PAIRS_API_URL } from '../api/boltzApiUrls';
import { useBoltzConfiguration } from '../context/NetworkContext';
import BoltzFetcher from './boltzRates';

export default function useBoltzFetcher(): BoltzFetcher | null {
  const [fetcher, setFetcher] = useState<BoltzFetcher | null>(null);
  const { apiEndpoint } = useBoltzConfiguration();
  const url = BOLTZ_GET_PAIRS_API_URL(apiEndpoint);

  useEffect(() => {
    const boltzFetcher = new BoltzFetcher({
      url,
    });
    setFetcher(boltzFetcher);
    return () => boltzFetcher.clean();
  }, [url]);

  return fetcher;
}
