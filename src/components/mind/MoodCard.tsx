import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  ReferenceArea,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DailyRecord } from '@/types/health';
import { getTrend } from '@/utils/trend';

const MOOD_FACES = [
  { max: 1.5, face: '😣' },
  { max: 2.5, face: '😕' },
  { max: 3.5, face: '😐' },
  { max: 4.5, face: '🙂' },
  { max: 5.1, face: '😊' },
];

function faceFor(value: number): string {
  return MOOD_FACES.find((f) => value <= f.max)?.face ?? '😐';
}

interface MoodCardProps {
  records: DailyRecord[];
}

export default function MoodCard({ records }: MoodCardProps) {
  const data = useMemo(
    () => records.slice(-30).map((r) => ({ day: r.missionDay, mood: r.mood })),
    [records]
  );

  const latest = data[data.length - 1]?.mood ?? 0;
  const last7 = data.slice(-7);
  const avg7 = last7.length > 0 ? last7.reduce((s, d) => s + d.mood, 0) / last7.length : 0;
  const trend = getTrend(records, 'mood');

  return (
    <div className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6 h-full">
      <h2 className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-4">
        Mood Trend
      </h2>

      <div className="flex items-center gap-4 mb-4">
        <motion.div
          key={latest}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-4xl"
        >
          {faceFor(latest)}
        </motion.div>
        <div>
          <p className="text-2xl font-bold text-space-text tabular-nums">{latest.toFixed(1)}</p>
          <p className="text-xs text-space-muted">today</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-lg font-semibold text-space-text tabular-nums">{avg7.toFixed(1)}</p>
          <p className="text-xs text-space-muted">7-day avg</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {trend.direction === 'up' ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-status-caution">
            <TrendingUp className="w-3.5 h-3.5" />
            {trend.percent}% up
          </span>
        ) : trend.direction === 'down' ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-status-caution">
            <TrendingDown className="w-3.5 h-3.5" />
            {trend.percent}% down
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-space-muted">
            <Minus className="w-3.5 h-3.5" />
            stable
          </span>
        )}
        <span className="text-xs text-space-muted">vs previous 7 days</span>
      </div>

      <div className="h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
              </linearGradient>
            </defs>
            <ReferenceArea y1={3.5} y2={5} fill="#22C55E" fillOpacity={0.1} stroke="none" />
            <XAxis
              dataKey="day"
              tick={{ fill: '#8A97B5', fontSize: 10 }}
              tickFormatter={(d: number) => `D${d}`}
              stroke="var(--color-border)"
              minTickGap={30}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fill: '#8A97B5', fontSize: 10 }}
              stroke="var(--color-border)"
              width={28}
            />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as { day: number; mood: number };
                return (
                  <div className="bg-space-surface border border-space-border rounded-lg px-3 py-2 shadow-xl text-xs">
                    <p className="text-space-muted">Day {d.day}</p>
                    <p className="text-space-text font-semibold">Mood: {d.mood.toFixed(1)}/5</p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="mood"
              stroke="#22D3EE"
              strokeWidth={2}
              fill="url(#moodGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-2 mt-3 text-[11px] text-space-muted">
        <span className="w-3 h-3 rounded-sm bg-status-normal/20 border border-status-normal/30" />
        Normal range: 3.5 – 5.0
      </div>
    </div>
  );
}
