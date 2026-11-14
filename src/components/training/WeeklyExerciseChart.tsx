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
            cursor={{ fill: 'rgba(34, 211, 238, 0.08)' }}
            contentStyle={{
              background: '#0F1626',
              border: '1px solid #1C2740',
              borderRadius: 12,
              padding: '10px 14px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
              color: '#E6ECF8',
              fontSize: 13,
            }}
            labelStyle={{ color: '#E6ECF8', fontWeight: 600, marginBottom: 4 }}
            itemStyle={{ color: '#E6ECF8', fontSize: 13 }}
            wrapperStyle={{ outline: 'none', zIndex: 50 }}
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
