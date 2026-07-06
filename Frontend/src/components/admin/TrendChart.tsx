import type { MonthlyTrendPoint } from '../../types/admin';
import { cn } from '../../utils/cn';

interface TrendChartProps {
  title: string;
  data: MonthlyTrendPoint[];
  className?: string;
}

export function TrendChart({ title, data, className }: TrendChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className={cn('bg-surface rounded-2xl p-6 border border-border', className)}>
      <h3 className="text-heading-md font-semibold text-primary mb-4">{title}</h3>
      <div className="flex items-end gap-2 h-40">
        {data.map((point) => (
          <div key={point.label} className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <span className="text-body-xs text-muted">{point.count}</span>
            <div
              className="w-full bg-accent/80 rounded-t-lg transition-all"
              style={{ height: `${Math.max((point.count / max) * 100, 4)}%` }}
            />
            <span className="text-body-xs text-muted truncate w-full text-center">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
