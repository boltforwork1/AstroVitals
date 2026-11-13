import { statusColor } from '@/utils/status';
import { metricStatus, metricUnit, type TrendMetric } from '@/utils/stats';

interface TrendTooltipProps {
  active?: boolean;
  payload?: {
    value?: number;
    payload?: { missionDay: number; main?: number; prev?: number };
  }[];
  label?: number | string;
  metric: TrendMetric;
}

export default function TrendTooltip({ active, payload, label, metric }: TrendTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const value = row?.main ?? payload[0]?.value;
  if (value === undefined) return null;

  const day = row?.missionDay ?? label;
  const status = metricStatus(metric, value);
  const color = statusColor(status);

  const prev = row?.prev;
  const delta = prev !== undefined && prev !== 0 ? value - prev : null;

  return (
    <div className="bg-space-surface border border-space-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-space-muted text-[10px] uppercase tracking-wider mb-1">
        Mission Day {day}
      </p>
      <p className="text-space-text font-semibold tabular-nums">
        {Math.round(value * 10) / 10}
        <span className="text-space-muted font-normal ml-1">{metricUnit(metric)}</span>
      </p>
      <div className="flex items-center gap-1.5 mt-1">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}80` }}
        />
        <span style={{ color }} className="capitalize font-medium">
          {status}
        </span>
      </div>
      {delta !== null && Math.round(delta * 10) !== 0 && (
        <p className="text-space-muted mt-0.5 tabular-nums">
          {delta > 0 ? '+' : ''}
          {Math.round(delta * 10) / 10} vs previous day
        </p>
      )}
    </div>
  );
}
