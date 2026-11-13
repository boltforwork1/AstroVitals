import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CAREER_LIMIT_MSV } from '@/data/radiationConfig';
import { statusColor } from '@/utils/status';
import type { DoseChartRow } from '@/utils/radiation';

const TICK = '#8A97B5';
const STORM_COLOR = '#F97316';
const DAILY_COLOR = '#22D3EE';
const CUMULATIVE_COLOR = '#E6ECF8';
const PROJECTION_COLOR = '#8A97B5';

interface DoseChartProps {
  rows: DoseChartRow[];
  projectedTotal: number;
}

export default function DoseChart({ rows, projectedTotal }: DoseChartProps) {
  const cumulativeMax = Math.ceil(Math.max(CAREER_LIMIT_MSV, projectedTotal) * 1.05);
  const lastDay = rows[rows.length - 1]?.missionDay ?? 0;

  return (
    <section
      aria-labelledby="dose-chart-title"
      className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 id="dose-chart-title" className="text-base font-semibold text-space-text">
            Dose by mission day
          </h2>
          <p className="text-xs text-space-muted mt-0.5">
            Daily dose (bars), cumulative dose (line), and projection to day {lastDay}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] text-space-muted">
          <LegendItem color={DAILY_COLOR} label="Daily dose" />
          <LegendItem color={CUMULATIVE_COLOR} label="Cumulative" />
          <LegendItem color={PROJECTION_COLOR} label="Projection" dashed />
          <LegendItem color={STORM_COLOR} label="Solar storm" dot />
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" strokeOpacity={0.5} vertical={false} />
            <XAxis
              dataKey="missionDay"
              tick={{ fill: TICK, fontSize: 11 }}
              tickFormatter={(d: number) => `D${d}`}
              stroke="var(--color-border)"
              minTickGap={24}
            />
            <YAxis
              yAxisId="daily"
              orientation="left"
              domain={[0, 'dataMax + 0.5']}
              tick={{ fill: TICK, fontSize: 11 }}
              stroke="var(--color-border)"
              width={40}
            />
            <YAxis
              yAxisId="cumulative"
              orientation="right"
              domain={[0, cumulativeMax]}
              tick={{ fill: TICK, fontSize: 11 }}
              stroke="var(--color-border)"
              width={48}
            />
            <ReferenceLine
              yAxisId="cumulative"
              y={CAREER_LIMIT_MSV}
              stroke={statusColor('critical')}
              strokeDasharray="6 4"
              label={{ value: 'Career limit', position: 'insideTopLeft', fill: statusColor('critical'), fontSize: 10 }}
            />
            <RechartsTooltip content={<DoseTooltip />} cursor={{ fill: 'rgba(34, 211, 238, 0.06)' }} />
            <Bar
              yAxisId="daily"
              dataKey="daily"
              fill={DAILY_COLOR}
              fillOpacity={0.55}
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
            <Line
              yAxisId="daily"
              dataKey="stormMarker"
              stroke="none"
              dot={renderStormDot}
              activeDot={false}
              isAnimationActive={false}
              legendType="none"
            />
            <Line
              yAxisId="cumulative"
              dataKey="cumulative"
              stroke={CUMULATIVE_COLOR}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              yAxisId="cumulative"
              dataKey="projected"
              stroke={PROJECTION_COLOR}
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

interface StormDotProps {
  cx?: number;
  cy?: number;
  payload?: DoseChartRow;
}

function renderStormDot({ cx, cy, payload }: StormDotProps) {
  if (cx === undefined || cy === undefined || payload?.stormMarker === undefined) return <g />;
  return <circle cx={cx} cy={cy} r={5} fill={STORM_COLOR} stroke="var(--color-bg)" strokeWidth={1.5} />;
}

interface DoseTooltipProps {
  active?: boolean;
  payload?: { payload?: DoseChartRow }[];
}

function DoseTooltip({ active, payload }: DoseTooltipProps) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="bg-space-surface border border-space-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-space-muted text-[10px] uppercase tracking-wider mb-1">Mission Day {row.missionDay}</p>
      {row.daily !== undefined && (
        <p className="text-space-text">
          Daily dose <span className="font-semibold tabular-nums">{row.daily.toFixed(2)} mSv</span>
        </p>
      )}
      {row.cumulative !== undefined && (
        <p className="text-space-text">
          Cumulative <span className="font-semibold tabular-nums">{row.cumulative.toFixed(1)} mSv</span>
        </p>
      )}
      {row.cumulative === undefined && row.projected !== undefined && (
        <p className="text-space-muted">
          Projected cumulative <span className="tabular-nums">{row.projected.toFixed(1)} mSv</span>
        </p>
      )}
      {row.stormMarker !== undefined && (
        <p className="mt-1 font-medium" style={{ color: STORM_COLOR }}>
          Solar storm day
        </p>
      )}
    </div>
  );
}

function LegendItem({ color, label, dashed, dot }: { color: string; label: string; dashed?: boolean; dot?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {dot ? (
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      ) : (
        <span className="w-4 h-0.5 rounded" style={{ backgroundColor: color, opacity: dashed ? 0.8 : 1 }} />
      )}
      {label}
    </span>
  );
}
