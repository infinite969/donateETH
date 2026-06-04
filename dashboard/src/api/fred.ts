import axios from 'axios';
import { DataPoint, FredApiResponse, SeriesConfig } from '../types';

export const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

export const SERIES_CONFIG: SeriesConfig[] = [
  {
    id: 'GDPC1',
    name: 'Real GDP',
    description: 'Real Gross Domestic Product, seasonally adjusted annual rate',
    unit: 'Billions USD',
    color: '#3B82F6',
  },
  {
    id: 'CPIAUCSL',
    name: 'CPI Inflation (YoY)',
    description: 'Consumer Price Index for All Urban Consumers, year-over-year change',
    unit: '%',
    color: '#EF4444',
    isYoY: true,
  },
  {
    id: 'UNRATE',
    name: 'Unemployment Rate',
    description: 'Civilian Unemployment Rate, seasonally adjusted',
    unit: '%',
    color: '#F59E0B',
    isPercent: true,
  },
  {
    id: 'FEDFUNDS',
    name: 'Federal Funds Rate',
    description: 'Effective Federal Funds Rate, monthly average',
    unit: '%',
    color: '#10B981',
    isPercent: true,
  },
  {
    id: 'DGS10',
    name: '10-Year Treasury Yield',
    description: 'Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity',
    unit: '%',
    color: '#8B5CF6',
    isPercent: true,
  },
  {
    id: 'UMCSENT',
    name: 'Consumer Sentiment',
    description: 'University of Michigan: Consumer Sentiment Index',
    unit: 'Index',
    color: '#F97316',
  },
  {
    id: 'HOUST',
    name: 'Housing Starts',
    description: 'Housing Starts: Total New Privately Owned Housing Units Started',
    unit: 'Thousands',
    color: '#06B6D4',
  },
  {
    id: 'M2SL',
    name: 'M2 Money Supply',
    description: 'M2 Money Stock, seasonally adjusted',
    unit: 'Billions USD',
    color: '#84CC16',
  },
  {
    id: 'INDPRO',
    name: 'Industrial Production',
    description: 'Industrial Production Index, seasonally adjusted',
    unit: 'Index',
    color: '#EC4899',
  },
  {
    id: 'BOPGSTB',
    name: 'Trade Balance',
    description: 'U.S. Trade Balance in Goods and Services',
    unit: 'Millions USD',
    color: '#6366F1',
  },
];

// Generate realistic mock data for all 10 indicators from 2015 to 2025
function generateMockData(seriesId: string): DataPoint[] {
  const data: DataPoint[] = [];
  const startYear = 2015;
  const endYear = 2025;

  // Base values and trends per series
  const seriesParams: Record<string, { base: number; trend: number; volatility: number; covidDip?: boolean }> = {
    GDPC1:    { base: 17000, trend: 80,    volatility: 200,  covidDip: true },
    CPIAUCSL: { base: 1.5,   trend: 0.02,  volatility: 0.3,  covidDip: false },
    UNRATE:   { base: 5.5,   trend: -0.03, volatility: 0.3,  covidDip: true },
    FEDFUNDS: { base: 0.5,   trend: 0.02,  volatility: 0.1,  covidDip: false },
    DGS10:    { base: 2.2,   trend: 0.01,  volatility: 0.2,  covidDip: false },
    UMCSENT:  { base: 90,    trend: 0.1,   volatility: 5,    covidDip: true },
    HOUST:    { base: 1100,  trend: 5,     volatility: 80,   covidDip: true },
    M2SL:     { base: 12000, trend: 150,   volatility: 100,  covidDip: false },
    INDPRO:   { base: 103,   trend: 0.1,   volatility: 1.5,  covidDip: true },
    BOPGSTB:  { base: -45000,trend: -50,   volatility: 3000, covidDip: false },
  };

  const params = seriesParams[seriesId] || { base: 100, trend: 0.1, volatility: 2 };

  let value = params.base;
  let month = 0;

  for (let year = startYear; year <= endYear; year++) {
    const monthsInYear = year === endYear ? 3 : 12;
    for (let m = 1; m <= monthsInYear; m++) {
      month++;
      const dateStr = `${year}-${String(m).padStart(2, '0')}-01`;

      // Long-term trend
      value += params.trend;

      // Seasonal variation
      const seasonal = Math.sin((month / 12) * 2 * Math.PI) * params.volatility * 0.3;

      // Random noise
      const noise = (Math.random() - 0.5) * params.volatility;

      let adjustedValue = value + seasonal + noise;

      // COVID shock in early 2020
      if (params.covidDip && year === 2020 && m >= 3 && m <= 6) {
        const severity = seriesId === 'UNRATE' ? 8 : -1;
        if (seriesId === 'UNRATE') {
          adjustedValue += severity * (1 - (m - 3) * 0.2);
        } else {
          adjustedValue *= 1 + severity * 0.05 * (1 - (m - 3) * 0.15);
        }
      }

      // Post-COVID recovery for UNRATE (spike then rapid return)
      if (seriesId === 'UNRATE' && year === 2020 && m === 4) adjustedValue = 14.7;
      if (seriesId === 'UNRATE' && year === 2020 && m === 5) adjustedValue = 13.2;
      if (seriesId === 'UNRATE' && year === 2020 && m === 6) adjustedValue = 11.1;
      if (seriesId === 'UNRATE' && year === 2020 && m === 7) adjustedValue = 10.2;
      if (seriesId === 'UNRATE' && year === 2020 && m === 8) adjustedValue = 8.4;

      // Post-COVID inflation surge
      if (seriesId === 'CPIAUCSL') {
        if (year === 2021 && m >= 6) adjustedValue = 4.5 + (m - 6) * 0.3;
        if (year === 2022 && m <= 6) adjustedValue = 7.5 + (m - 1) * 0.2;
        if (year === 2022 && m > 6) adjustedValue = 8.5 - (m - 6) * 0.4;
        if (year === 2023) adjustedValue = 5.0 - (m - 1) * 0.2;
        if (year === 2024) adjustedValue = 3.0 - (m - 1) * 0.05;
        if (year === 2025) adjustedValue = 2.5;
      }

      // Post-COVID rate hikes
      if (seriesId === 'FEDFUNDS') {
        if (year < 2022) adjustedValue = Math.max(0.05, adjustedValue);
        if (year === 2022 && m >= 3) adjustedValue = Math.min(4.5, 0.1 + (m - 3) * 0.5);
        if (year === 2023) adjustedValue = 5.0 + Math.random() * 0.1;
        if (year === 2024 && m <= 9) adjustedValue = 5.3 + Math.random() * 0.05;
        if (year === 2024 && m > 9) adjustedValue = 4.5 - (m - 9) * 0.2;
        if (year === 2025) adjustedValue = 4.0 + Math.random() * 0.1;
      }

      data.push({ date: dateStr, value: Math.round(adjustedValue * 100) / 100 });
    }
  }

  return data;
}

// Cache for mock data so it's stable across renders
const mockDataCache = new Map<string, DataPoint[]>();

export function getMockData(seriesId: string): DataPoint[] {
  if (!mockDataCache.has(seriesId)) {
    mockDataCache.set(seriesId, generateMockData(seriesId));
  }
  return mockDataCache.get(seriesId)!;
}

export function hasApiKey(): boolean {
  const key = import.meta.env.VITE_FRED_API_KEY;
  return Boolean(key && key.trim() !== '' && key !== 'your_api_key_here');
}

export async function fetchSeriesObservations(
  seriesId: string,
  startDate: string
): Promise<DataPoint[]> {
  const apiKey = import.meta.env.VITE_FRED_API_KEY;

  if (!hasApiKey()) {
    throw new Error('No API key configured');
  }

  const url = `${FRED_BASE_URL}/series/observations`;
  const response = await axios.get<FredApiResponse>(url, {
    params: {
      series_id: seriesId,
      api_key: apiKey,
      file_type: 'json',
      sort_order: 'asc',
      observation_start: startDate,
    },
  });

  const observations = response.data.observations;

  // Filter out missing values (FRED uses "." for missing)
  const points: DataPoint[] = observations
    .filter((obs) => obs.value !== '.' && obs.value !== '')
    .map((obs) => ({
      date: obs.date,
      value: parseFloat(obs.value),
    }))
    .filter((p) => !isNaN(p.value));

  return points;
}

export function computeYoYChange(data: DataPoint[]): DataPoint[] {
  if (data.length < 13) return data;

  const result: DataPoint[] = [];
  for (let i = 12; i < data.length; i++) {
    const current = data[i].value;
    const yearAgo = data[i - 12].value;
    if (yearAgo !== 0) {
      result.push({
        date: data[i].date,
        value: Math.round(((current - yearAgo) / yearAgo) * 10000) / 100,
      });
    }
  }
  return result;
}
