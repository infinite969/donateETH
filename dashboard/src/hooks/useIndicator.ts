import { useState, useEffect } from 'react';
import {
  fetchSeriesObservations,
  getMockData,
  hasApiKey,
  computeYoYChange,
} from '../api/fred';
import { DataPoint, IndicatorData } from '../types';

// Module-level cache keyed by seriesId+startDate
const cache = new Map<string, DataPoint[]>();

export function useIndicator(
  seriesId: string,
  startDate: string,
  isYoY = false
): IndicatorData {
  const [data, setData] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `${seriesId}:${startDate}`;

    async function load() {
      setIsLoading(true);
      setError(null);

      // Check cache first
      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey)!;
        if (!cancelled) {
          setData(cached);
          setIsLoading(false);
        }
        return;
      }

      if (!hasApiKey()) {
        // Use mock data, filtered to startDate
        const mock = getMockData(seriesId);
        const filtered = mock.filter((p) => p.date >= startDate);
        const processed = isYoY ? computeYoYChange(filtered) : filtered;
        cache.set(cacheKey, processed);
        if (!cancelled) {
          setData(processed);
          setIsLoading(false);
        }
        return;
      }

      try {
        const raw = await fetchSeriesObservations(seriesId, startDate);
        const processed = isYoY ? computeYoYChange(raw) : raw;
        cache.set(cacheKey, processed);
        if (!cancelled) {
          setData(processed);
          setIsLoading(false);
        }
      } catch (err) {
        // Fall back to mock data on any error
        const mock = getMockData(seriesId);
        const filtered = mock.filter((p) => p.date >= startDate);
        const processed = isYoY ? computeYoYChange(filtered) : filtered;
        cache.set(cacheKey, processed);
        if (!cancelled) {
          setData(processed);
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [seriesId, startDate, isYoY]);

  const latestValue = data.length > 0 ? data[data.length - 1].value : null;
  const prevValue = data.length > 1 ? data[data.length - 2].value : null;

  let change: number | null = null;
  let changePercent: number | null = null;

  if (latestValue !== null && prevValue !== null) {
    change = Math.round((latestValue - prevValue) * 1000) / 1000;
    changePercent =
      prevValue !== 0
        ? Math.round(((latestValue - prevValue) / Math.abs(prevValue)) * 10000) / 100
        : null;
  }

  return { data, latestValue, change, changePercent, isLoading, error };
}
