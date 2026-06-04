import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
} from 'recharts';
import { DataPoint } from '../types';

interface IndicatorChartProps {
  data: DataPoint[];
  color: string;
  unit: string;
  seriesId: string;
}

function formatValue(value: number, unit: string): string {
  if (unit === '%') return `${value.toFixed(2)}%`;
  if (unit === 'Billions USD') {
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}T`;
    return `$${value.toFixed(0)}B`;
  }
  if (unit === 'Millions USD') {
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}B`;
    return `$${value.toFixed(0)}M`;
  }
  if (unit === 'Thousands') return `${value.toFixed(0)}K`;
  if (unit === 'Index') return value.toFixed(1);
  return value.toFixed(2);
}

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

function CustomTooltip({ active, payload, label, unit }: TooltipProps<number, string> & { unit: string }) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value as number;
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 shadow-xl text-sm">
      <p className="text-gray-400 mb-1">{formatDate(label as string)}</p>
      <p className="text-white font-semibold">{formatValue(value, unit)}</p>
    </div>
  );
}

export function IndicatorChart({ data, color, unit, seriesId }: IndicatorChartProps) {
  const gradientId = `gradient-${seriesId}`;

  // Only show a reasonable number of X-axis ticks
  const tickInterval = Math.max(1, Math.floor(data.length / 5));

  return (
    <ResponsiveContainer width="100%" height={100}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 9, fill: '#9CA3AF' }}
          tickLine={false}
          axisLine={false}
          interval={tickInterval}
          tickFormatter={(d: string) => {
            const parts = d.split('-');
            return `${parts[0].slice(2)}`;
          }}
        />
        <YAxis
          tick={{ fontSize: 9, fill: '#9CA3AF' }}
          tickLine={false}
          axisLine={false}
          tickCount={4}
          tickFormatter={(v: number) => {
            if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
            if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}K`;
            return v.toFixed(0);
          }}
        />
        <Tooltip content={<CustomTooltip unit={unit} />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
