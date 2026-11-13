import { useMemo, useRef, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useRecords } from '@/context/RecordsContext';
import { statusColor } from '@/utils/status';
import {
  METRIC_LABEL,
  TREND_METRICS,
  cautionRangeFor,
  countOutOfRange,
  getSeries,
  getStats,
  metricStatus,
  metricUnit,
  normalRangeFor,
  type TrendMetric,
  type TrendRange,
} from '@/utils/stats';
import TrendTooltip from '@/components/trends/TrendTooltip';
import InsightBox from '@/components/trends/InsightBox';
import MiniTrendChart from '@/components/trends/MiniTrendChart';
import ExportCsvButton from '@/components/trends/ExportCsvButton';

const RANGES: { label: string; value: TrendRange }[] = [
  { label: '7D', value: 7 },
  { label: '14D', value: 14 },
  { label: '30D', value: 30 },
  { label: 'All', value: 'All' },
];

const COMPARE_COLOR = '#A78BFA';
const MIN_RECORDS_FOR_CHART = 3;

// Rows fed to recharts. `main` is the selected metric (systolic for BP),
// `compare` is the compared metric (diastolic for BP), `prev` is the
// selected metric's previous-day value for the tooltip.
interface ChartRow {
  missionDay: number;
  main?: number;
  compare?: number;
  prev?: number;
}

export default function Trends() {
  const { records } = useRecords();
  const [range, setRange] = useState<TrendRange>(30);
  const [metric, setMetric] = useState<TrendMetric>('healthScore');
  const [compareOn, setCompareOn] = useState(false);
  const [compareMetric, setCompareMetric] = useState<TrendMetric>('sleep');
  const topRef = useRef<HTMLDivElement>(null);

  const isBp = metric === 'bloodPressure';
  const showCompare = compareOn && compareMetric !== metric && !isBp;

  const selectMetric = (m: TrendMetric) => {
    setMetric(m);
    if (m === 'bloodPressure' || m === compareMetric) setCompareOn(false);
  };

  const series = useMemo(() => getSeries(records, metric, range), [records, metric, range]);

  // Blood pressure plots both components; the stats panel reflects systolic.
  const bpSeries = useMemo(
    () => (isBp ? getSeries(records, 'diastolic', range) : null),
    [records, isBp, range]
  );

  const compareSeries = useMemo(
    () => (showCompare ? getSeries(records, compareMetric, range) : null),
    [records, showCompare, compareMetric, range]
  );

  const enoughData = series.length >= MIN_RECORDS_FOR_CHART;

  const chartData = useMemo<ChartRow[]>(() => {
    if (!enoughData) return [];
    const map = new Map<number, ChartRow>();
    series.forEach((p, i) => {
      map.set(p.missionDay, {
        missionDay: p.missionDay,
        main: p.value,
        prev: i > 0 ? series[i - 1].value : undefined,
      });
    });
    const second = isBp ? bpSeries : compareSeries;
    second?.forEach((p) => {
      const row: ChartRow = map.get(p.missionDay) ?? { missionDay: p.missionDay };
      row.compare = p.value;
      map.set(p.missionDay, row);
    });
    return Array.from(map.values()).sort((a, b) => a.missionDay - b.missionDay);
  }, [series, bpSeries, compareSeries, isBp, enoughData]);

  const stats = useMemo(() => (enoughData ? getStats(series) : null), [series, enoughData]);
  const outOfRange = useMemo(
    () => (enoughData ? countOutOfRange(series, isBp ? 'systolic' : metric) : { count: 0, streak: 0 }),
    [series, metric, isBp, enoughData]
  );

  const latestValue = series[series.length - 1]?.value ?? 0;
  const latestStatus = metricStatus(metric, latestValue);
  const lineColor = statusColor(latestStatus);

  const normalRange = normalRangeFor(metric);
  const cautionRange = cautionRangeFor(metric);
  const isHealthScore = metric === 'healthScore';

  const yDomain = useMemo<[number, number]>(() => {
    const rows: ChartRow[] = chartData.length > 0 ? chartData : [{ missionDay: 0, main: 0 }];
    const values = rows
      .flatMap((d) => [d.main, d.compare])
      .filter((v): v is number => v !== undefined);
    let lo = values.length > 0 ? Math.min(...values) : 0;
    let hi = values.length > 0 ? Math.max(...values) : 1;
    if (!isBp) {
      if (normalRange) {
        lo = Math.min(lo, normalRange.min);
        hi = Math.max(hi, normalRange.max);
      }
      if (cautionRange) {
        lo = Math.min(lo, cautionRange.min);
        hi = Math.max(hi, cautionRange.max);
      }
      if (isHealthScore) hi = Math.max(hi, 100);
    }
    const pad = (hi - lo) * 0.1 || 1;
    return [Math.floor(lo - pad), Math.ceil(hi + pad)];
  }, [chartData, normalRange, cautionRange, isBp, isHealthScore]);

  const renderDot = (props: { cx?: number; cy?: number; payload?: { main?: number } }) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined || payload?.main === undefined) return null;
    const s = metricStatus(metric, payload.main);
    const isCritical = s === 'critical';
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isCritical ? 5 : 3}
        fill={statusColor(s)}
        stroke="var(--color-bg)"
        strokeWidth={1.5}
      />
    );
  };

  const tooltipContent = <TrendTooltip metric={metric} />;

  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const miniRanges = useMemo(() => {
    const map = new Map<TrendMetric, { min: number; max: number } | null>();
    TREND_METRICS.forEach((m) => map.set(m, normalRangeFor(m)));
    return map;
  }, []);

  return (
    <div ref={topRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-space-text">Trends</h1>
          <p className="text-sm text-space-muted mt-0.5">How your vitals evolve across the mission</p>
        </div>
        <ExportCsvButton records={records} />
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex shrink-0 rounded-xl border border-space-border bg-space-surface p-1 self-start">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r.value)}
              aria-pressed={range === r.value}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                range === r.value ? 'bg-accent/15 text-accent' : 'text-space-muted hover:text-space-text'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mb-1">
          {TREND_METRICS.map((m) => {
            const last = getSeries(records, m, 7);
            const s = last.length > 0 ? metricStatus(m, last[last.length - 1].value) : 'normal';
            const c = statusColor(s);
            return (
              <button
                key={m}
                onClick={() => selectMetric(m)}
                aria-pressed={metric === m}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                  metric === m
                    ? 'bg-accent/10 border-accent/40 text-accent'
                    : 'bg-space-surface border-space-border text-space-muted hover:text-space-text'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: c, boxShadow: `0 0 4px ${c}80` }}
                />
                {METRIC_LABEL[m]}
              </button>
            );
          })}
        </div>

        {!isBp && (
          <div className="flex items-center gap-2 self-start">
            <button
              onClick={() => setCompareOn((v) => !v)}
              role="switch"
              aria-checked={compareOn}
              aria-label="Compare with a second indicator"
              className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                compareOn ? 'bg-accent/40' : 'bg-space-border'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-space-text transition-transform ${
                  compareOn ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className="text-xs text-space-muted">Compare</span>
            {compareOn && (
              <select
                value={compareMetric === metric ? 'sleep' : compareMetric}
                onChange={(e) => setCompareMetric(e.target.value as TrendMetric)}
                aria-label="Second indicator to compare"
                className="bg-space-surface border border-space-border rounded-lg text-xs text-space-text px-2 py-1.5 focus:outline-none focus:border-accent/50"
              >
                {TREND_METRICS.filter((m) => m !== metric && m !== 'bloodPressure').map((m) => (
                  <option key={m} value={m}>
                    {METRIC_LABEL[m]}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Main chart */}
      <div className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-space-text">{METRIC_LABEL[metric]}</h2>
            <p className="text-xs text-space-muted mt-0.5">
              {isBp
                ? 'Systolic and diastolic shown together'
                : showCompare
                  ? `Compared with ${METRIC_LABEL[compareMetric]}`
                  : `Last ${range === 'All' ? records.length : range} days`}
            </p>
          </div>
          {stats && (
            <span
              className="text-xs font-medium px-2 py-1 rounded-full tabular-nums shrink-0"
              style={{ backgroundColor: `${lineColor}15`, color: lineColor }}
            >
              {formatNum(latestValue)}
              {metricUnit(metric) ? ` ${metricUnit(metric)}` : ''}
            </span>
          )}
        </div>

        {!enoughData ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-space-muted max-w-xs">
              Not enough data yet — complete a few more check-ins to see a trend for this range.
            </p>
          </div>
        ) : (
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" strokeOpacity={0.5} />
                <XAxis
                  dataKey="missionDay"
                  tick={{ fill: '#8A97B5', fontSize: 11 }}
                  tickFormatter={(d: number) => `Day ${d}`}
                  stroke="var(--color-border)"
                />
                <YAxis
                  domain={yDomain}
                  tick={{ fill: '#8A97B5', fontSize: 11 }}
                  stroke="var(--color-border)"
                  label={{
                    value: metricUnit(metric) || 'score',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#8A97B5', fontSize: 11 },
                  }}
                />
                {showCompare && (
                  <YAxis
                    yAxisId="compare"
                    orientation="right"
                    tick={{ fill: COMPARE_COLOR, fontSize: 10 }}
                    stroke={COMPARE_COLOR}
                  />
                )}

                {/* Target zones */}
                {!isBp && normalRange && (
                  <ReferenceArea
                    y1={normalRange.min}
                    y2={Math.min(normalRange.max, yDomain[1])}
                    fill="rgba(34, 197, 94, 0.13)"
                    stroke="none"
                  />
                )}
                {!isBp && cautionRange && normalRange && yDomain[0] < normalRange.min && (
                  <ReferenceArea
                    y1={yDomain[0]}
                    y2={normalRange.min}
                    fill="rgba(245, 158, 11, 0.07)"
                    stroke="none"
                  />
                )}
                {!isBp && cautionRange && normalRange && yDomain[1] > normalRange.max && (
                  <ReferenceArea
                    y1={normalRange.max}
                    y2={yDomain[1]}
                    fill="rgba(245, 158, 11, 0.07)"
                    stroke="none"
                  />
                )}

                <ReferenceLine
                  x={chartData[chartData.length - 1].missionDay}
                  stroke="#22D3EE"
                  strokeDasharray="4 4"
                  strokeOpacity={0.7}
                  label={{ value: 'Today', fill: '#22D3EE', fontSize: 10, position: 'insideTopRight' }}
                />

                <RechartsTooltip content={tooltipContent} />

                {(isBp || showCompare) && (
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(value: string) => (
                      <span style={{ color: value === 'compare' ? COMPARE_COLOR : lineColor }}>
                        {isBp
                          ? value === 'main'
                            ? 'Systolic'
                            : 'Diastolic'
                          : value === 'main'
                            ? METRIC_LABEL[metric]
                            : METRIC_LABEL[compareMetric]}
                      </span>
                    )}
                  />
                )}

                <Line
                  type="monotone"
                  dataKey="main"
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={isBp ? false : renderDot}
                  isAnimationActive
                  animationDuration={600}
                />
                {isBp && (
                  <Line
                    type="monotone"
                    dataKey="compare"
                    stroke={COMPARE_COLOR}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                    animationDuration={600}
                  />
                )}
                {showCompare && (
                  <Line
                    type="monotone"
                    dataKey="compare"
                    yAxisId="compare"
                    stroke={COMPARE_COLOR}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                    animationDuration={600}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stats row */}
        {stats && enoughData && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <StatCard
              label="Latest"
              value={formatNum(stats.latest)}
              unit={metricUnit(metric)}
              color={lineColor}
              trend={{ percent: stats.percentChange }}
            />
            <StatCard
              label="Average"
              value={formatNum(stats.average)}
              unit={metricUnit(metric)}
              color="#8A97B5"
            />
            <StatCard
              label="Min / Max"
              value={`${formatNum(stats.min)} / ${formatNum(stats.max)}`}
              unit={metricUnit(metric)}
              color="#8A97B5"
            />
            <StatCard
              label="Days out of range"
              value={String(outOfRange.count)}
              unit={outOfRange.streak > 0 ? `${outOfRange.streak} in a row` : 'all clear'}
              color={outOfRange.count > 0 ? statusColor('caution') : statusColor('normal')}
            />
          </div>
        )}
      </div>

      {/* Insight */}
      {enoughData && <InsightBox metric={metric} series={series} />}

      {/* Small multiples */}
      <div>
        <h2 className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-4">
          All indicators at a glance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TREND_METRICS.map((m) => (
            <MiniTrendChart
              key={m}
              metric={m}
              series={getSeries(records, m, 14)}
              normalRange={miniRanges.get(m)}
              onClick={() => {
                selectMetric(m);
                scrollToTop();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function formatNum(n: number): string {
  return String(Math.round(n * 10) / 10);
}

function StatCard({
  label,
  value,
  unit,
  color,
  trend,
}: {
  label: string;
  value: string;
  unit?: string;
  color: string;
  trend?: { percent: number };
}) {
  return (
    <div className="bg-space-bg/40 border border-space-border rounded-lg px-4 py-3">
      <p className="text-[10px] text-space-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-semibold text-space-text tabular-nums leading-tight">
        {value}
        {unit && <span className="text-xs text-space-muted font-normal ml-1">{unit}</span>}
      </p>
      {trend && (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium mt-1 ${
            trend.percent > 0
              ? 'text-status-caution'
              : trend.percent < 0
                ? 'text-status-normal'
                : 'text-space-muted'
          }`}
        >
          {trend.percent > 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : trend.percent < 0 ? (
            <TrendingDown className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
          {Math.round(Math.abs(trend.percent) * 10) / 10}% vs first half
        </span>
      )}
      <span className="block w-full h-0.5 mt-2 rounded-full" style={{ backgroundColor: `${color}40` }} />
    </div>
  );
}
