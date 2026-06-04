interface HeaderProps {
  lastUpdated: Date;
}

export function Header({ lastUpdated }: HeaderProps) {
  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4 sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Economic Indicator Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Federal Reserve Data (FRED)</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Last Updated</p>
          <p className="text-sm text-gray-300 font-mono">
            {lastUpdated.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </header>
  );
}
