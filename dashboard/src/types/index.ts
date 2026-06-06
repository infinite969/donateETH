export interface DataPoint {
  date: string;
  value: number;
}

export interface SeriesConfig {
  id: string;
  name: string;
  description: string;
  unit: string;
  color: string;
  isPercent?: boolean;
  isYoY?: boolean;
}

export interface IndicatorData {
  data: DataPoint[];
  latestValue: number | null;
  change: number | null;
  changePercent: number | null;
  isLoading: boolean;
  error: string | null;
}

export type TimeRange = '1Y' | '3Y' | '5Y' | '10Y' | 'All';

export interface FredObservation {
  date: string;
  value: string;
}

export interface FredApiResponse {
  observations: FredObservation[];
}
