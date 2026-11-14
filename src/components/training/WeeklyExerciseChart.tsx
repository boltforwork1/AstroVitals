import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { WeekDay } from '@/utils/trainingStats';

const TICK = '#8A97B5';
const ON_TRACK = '#22D3EE';
const OFF_TRACK = '#3A4A6B';
const TARGET = '#F59E0B';

interface WeeklyExerciseChartProps {
  days: WeekDay[];
  target: number;
}

export default function WeeklyExerciseChart({ days, target }: WeeklyExerciseChartProps) {
  const maxValue = Math.max(target, ...days.map((d) => d.minutes));

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={days} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" strokeOpacity={0.5} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: TICK, fontSize: 11 }} stroke="var(--color-border)" />
          <YAxis
            tick={{ fill: TICK, fontSize: 11 }}
            stroke="var(--color-border)"
            width={36}
            domain={[0, Math.ceil(maxValue * 1.1)]}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-accent-glow)' }}
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              color: 'var(--color-text)',
              fontSize: 12,
            }}
            formatter={(value) => [`${value} min`, 'Exercise']}
          />
          <ReferenceLine
            y={target}
            stroke={TARGET}
            strokeDasharray="4 4"
            label={{ value: `Target ${target} min`, fill: TARGET, fontSize: 11, position: 'insideTopRight' }}
          />
          <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
            {days.map((d) => (
              <Cell key={d.label} fill={d.onTrack ? ON_TRACK : OFF_TRACK} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
