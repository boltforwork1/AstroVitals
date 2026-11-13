import { statusColor } from '@/utils/status';
import type { TrendMetric } from '@/utils/stats';
import { METRIC_LABEL, metricStatus, metricUnit } from '@/utils/stats';

interface MiniTrendChartProps {
  metric: TrendMetric;
  series: { missionDay: number; value: number }[];
  normalRange?: { min: number; max: number } | null;
  onClick: () => void;
}

// Last-14-days sparkline card. Pure SVG (no axes) to stay light.
export default function MiniTrendChart({
  metric,
  series,
  normalRange,
  onClick,
}: MiniTrendChartProps) {
  const W = 240;
  const H = 60;
  const PAD = 4;

  if (series.length < 2) {
    return (
      <div className="w-full bg-space-surface border border-space-border rounded-xl p-4 opacity-60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-space-text">{METRIC_LABEL[metric]}</span>
          <span className="text-[10px] text-space-muted">no data</span>
        </div>
        <div className="h-14 flex items-center justify-center">
          <span className="text-[11px] text-space-muted">Not enough data yet</span>
        </div>
      </div>
    );
  }

  const values = series.map((p) => p.value);
  const lo = normalRange ? Math.min(...values, normalRange.min) : Math.min(...values);
  const hi = normalRange ? Math.max(...values, normalRange.max) : Math.max(...values);
  const range = hi - lo || 1;

  const x = (i: number) => PAD + (i / (series.length - 1)) * (W - 2 * PAD);
  const y = (v: number) => H - PAD - ((v - lo) / range) * (H - 2 * PAD);

  const pathD = series
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(' ');

  const latestValue = values[values.length - 1];
  const status = metricStatus(metric, latestValue);
  const color = statusColor(status);

  const bandTop = normalRange ? y(Math.min(normalRange.max, hi)) : 0;
  const bandBottom = normalRange ? y(Math.max(normalRange.min, lo)) : 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-space-surface border border-space-border rounded-xl p-4 transition-all duration-200 hover:border-accent/40 hover:shadow-[0_0_16px_var(--color-accent-glow)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className="text-xs font-medium text-space-text truncate">{METRIC_LABEL[metric]}</span>
        <span className="inline-flex items-center gap-1.5 shrink-0">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
          />
          <span className="text-sm font-semibold text-space-text tabular-nums">
            {Math.round(latestValue * 10) / 10}
          </span>
          <span className="text-[10px] text-space-muted">{metricUnit(metric)}</span>
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14" preserveAspectRatio="none" aria-hidden="true">
        {normalRange && (
          <rect
            x={0}
            y={bandTop}
            width={W}
            height={Math.max(2, bandBottom - bandTop)}
            fill="rgba(34, 197, 94, 0.12)"
          />
        )}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={x(series.length - 1)}
          cy={y(latestValue)}
          r={3}
          fill={color}
          stroke="var(--color-bg)"
          strokeWidth={1.5}
        />
      </svg>
    </button>
  );
}
