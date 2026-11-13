import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useRecords } from '@/context/RecordsContext';
import { indicators } from '@/data/indicators';
import type { IndicatorKey } from '@/types/health';
import { linearForecast } from '@/utils/forecast';
import { PREDICTION_HORIZON_DAYS, PREDICTION_SAMPLE_DAYS, formatWithUnit } from '@/utils/alerts';

interface PredictionChartProps {
  indicatorKey: IndicatorKey;
}

const ACCENT = '#22D3EE';
const GRID = '#1C2740';
const TICK = '#8A97B5';

export default function PredictionChart({ indicatorKey }: PredictionChartProps) {
  const { records } = useRecords();
  const ind = indicators[indicatorKey];
  const sample = records.slice(-PREDICTION_SAMPLE_DAYS);
  const fit = linearForecast(sample.map((r) => r[indicatorKey]));
  const latestDay = sample[sample.length - 1].missionDay;
  const projected = fit.predict(PREDICTION_HORIZON_DAYS);

  const data = [
    ...sample.map((r, i) => ({
      day: r.missionDay,
      actual: r[indicatorKey],
      projected: i === sample.length - 1 ? r[indicatorKey] : undefined,
    })),
    ...Array.from({ length: PREDICTION_HORIZON_DAYS }, (_, k) => ({
      day: latestDay + k + 1,
      actual: undefined,
      projected: fit.predict(k + 1),
    })),
  ];

  const values = data
    .flatMap((d) => [d.actual, d.projected])
    .filter((v): v is number => v !== undefined);
  const low = Math.min(...values, ind.normalRange.min);
  const high = Math.max(...values, ind.normalRange.max);
  const pad = (high - low) * 0.1 || 1;

  return (
    <div className="rounded-lg bg-space-bg/50 border border-space-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="text-[11px] text-space-muted">Last 10 days and projection</span>
        <span className="text-xs font-medium text-accent tabular-nums">
          Projected: {formatWithUnit(projected, ind.unit)} in {PREDICTION_HORIZON_DAYS} days
        </span>
      </div>
      <div className="h-40 w-full" role="img" aria-label={`${ind.label} last 10 days with a 7 day projection`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <ReferenceArea
              y1={ind.normalRange.min}
              y2={ind.normalRange.max}
              fill="#22C55E"
              fillOpacity={0.12}
              stroke="none"
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: TICK }}
              tickFormatter={(d: number) => `D${d}`}
              stroke={GRID}
            />
            <YAxis
              domain={[low - pad, high + pad]}
              tick={{ fontSize: 10, fill: TICK }}
              width={36}
              stroke={GRID}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke={ACCENT}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke={ACCENT}
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
