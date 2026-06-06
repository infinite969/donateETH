import { TimeRange } from '../types';

const RANGES: TimeRange[] = ['1Y', '3Y', '5Y', '10Y', 'All'];

interface RangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function RangeSelector({ selected, onChange }: RangeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
      {RANGES.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
            selected === range
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
