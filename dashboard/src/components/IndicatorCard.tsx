import { SeriesConfig, IndicatorData } from '../types';
import { SkeletonCard } from './LoadingSpinner';
import { IndicatorChart } from './IndicatorChart';

interface IndicatorCardProps {
  series: SeriesConfig;
  indicator: IndicatorData;
}

function formatValue(value: number | null, unit: string): string {
  if (value === null) return '--';
  if (unit === '%') return `${value.toFixed(2)}%`;
  if (unit === 'Billions USD') {
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(2)}T`;
    return `$${value.toFixed(1)}B`;
  }
  if (unit === 'Millions USD') {
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}B`;
    return `$${Math.abs(value).toFixed(0)}M${value < 0 ? ' deficit' : ''}`;
  }
  if (unit === 'Thousands') return `${value.toFixed(0)}K`;
  if (unit === 'Index') return value.toFixed(1);
  return value.toFixed(2);
}

function formatChange(change: number | null, changePercent: number | null, unit: string): string {
  if (change === null || changePercent === null) return '';
  const sign = change >= 0 ? '+' : '';
  if (unit === '%') {
    return `${sign}${change.toFixed(2)} pp`;
  }
  return `${sign}${changePercent.toFixed(2)}%`;
}

export function IndicatorCard({ series, indicator }: IndicatorCardProps) {
  const { data, latestValue, change, changePercent, isLoading } = indicator;

  if (isLoading) {
    return <SkeletonCard />;
  }

  const isPositive = change !== null && change >= 0;
  const changeStr = formatChange(change, changePercent, series.unit);

  // For UNRATE and trade balance, negative change is good
  const invertedSeries = ['UNRATE', 'BOPGSTB'];
  const isGoodChange = invertedSeries.includes(series.id) ? !isPositive : isPositive;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-gray-600 hover:shadow-lg hover:shadow-black/30 transition-all duration-200 flex flex-col gap-3">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-white leading-tight">{series.name}</h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
            style={{ backgroundColor: `${series.color}22`, color: series.color }}
          >
            {series.unit}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 leading-snug">{series.description}</p>
      </div>

      {/* Latest value */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-white tabular-nums">
          {formatValue(latestValue, series.unit)}
        </span>
        {changeStr && (
          <span
            className={`text-xs font-medium flex items-center gap-0.5 ${
              isGoodChange ? 'text-green-400' : 'text-red-400'
            }`}
          >
            <span>{isPositive ? '▲' : '▼'}</span>
            {changeStr}
          </span>
        )}
      </div>

      {/* Chart */}
      {data.length > 1 ? (
        <IndicatorChart
          data={data}
          color={series.color}
          unit={series.unit}
          seriesId={series.id}
        />
      ) : (
        <div className="h-24 flex items-center justify-center text-gray-600 text-xs">
          No chart data available
        </div>
      )}
    </div>
  );
}
