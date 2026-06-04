import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { RangeSelector } from './components/RangeSelector';
import { IndicatorCard } from './components/IndicatorCard';
import { useIndicator } from './hooks/useIndicator';
import { SERIES_CONFIG, hasApiKey } from './api/fred';
import { TimeRange, SeriesConfig } from './types';

function getStartDate(range: TimeRange): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  switch (range) {
    case '1Y':
      return `${year - 1}-${month}-${day}`;
    case '3Y':
      return `${year - 3}-${month}-${day}`;
    case '5Y':
      return `${year - 5}-${month}-${day}`;
    case '10Y':
      return `${year - 10}-${month}-${day}`;
    case 'All':
      return '1900-01-01';
  }
}

function ApiKeyBanner() {
  return (
    <div className="bg-amber-900/40 border border-amber-700/60 rounded-xl p-5 mb-6 mx-auto max-w-screen-2xl">
      <h2 className="text-amber-400 font-semibold text-sm mb-2 flex items-center gap-2">
        <span>No FRED API Key Configured</span>
        <span className="text-xs bg-amber-800/60 px-2 py-0.5 rounded-full">Using Mock Data</span>
      </h2>
      <p className="text-amber-300/80 text-sm mb-3">
        The dashboard is showing sample data. To use live Federal Reserve data:
      </p>
      <ol className="text-amber-300/70 text-sm space-y-1.5 list-decimal list-inside">
        <li>
          Get a free API key at{' '}
          <a
            href="https://fred.stlouisfed.org/docs/api/api_key.html"
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 underline hover:text-amber-300"
          >
            fred.stlouisfed.org/docs/api/api_key.html
          </a>
        </li>
        <li>
          Copy <code className="bg-gray-900/60 px-1.5 py-0.5 rounded font-mono text-xs">.env.example</code> to{' '}
          <code className="bg-gray-900/60 px-1.5 py-0.5 rounded font-mono text-xs">.env</code> and fill in{' '}
          <code className="bg-gray-900/60 px-1.5 py-0.5 rounded font-mono text-xs">VITE_FRED_API_KEY</code>
        </li>
        <li>Restart the dev server</li>
      </ol>
    </div>
  );
}

function IndicatorCardLoader({
  series,
  startDate,
}: {
  series: SeriesConfig;
  startDate: string;
}) {
  const indicator = useIndicator(series.id, startDate, series.isYoY);
  return <IndicatorCard series={series} indicator={indicator} />;
}

export default function App() {
  const [range, setRange] = useState<TimeRange>('5Y');
  const [lastUpdated] = useState(() => new Date());
  const apiKeyPresent = hasApiKey();

  const startDate = useMemo(() => getStartDate(range), [range]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header lastUpdated={lastUpdated} />

      <main className="px-4 py-6 max-w-screen-2xl mx-auto">
        {!apiKeyPresent && <ApiKeyBanner />}

        {/* Range selector */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <h2 className="text-gray-300 text-sm font-medium">
            {SERIES_CONFIG.length} Indicators &mdash; {range} View
          </h2>
          <RangeSelector selected={range} onChange={setRange} />
        </div>

        {/* Indicator grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERIES_CONFIG.map((series) => (
            <IndicatorCardLoader
              key={series.id}
              series={series}
              startDate={startDate}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-gray-600 text-xs pb-6">
          Data sourced from the Federal Reserve Bank of St. Louis (FRED).
          {' '}
          {!apiKeyPresent && 'Displaying mock/sample data.'}
        </footer>
      </main>
    </div>
  );
}
