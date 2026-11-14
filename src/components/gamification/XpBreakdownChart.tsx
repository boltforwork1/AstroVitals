import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useGamification } from '@/context/GamificationContext';

const COLORS = {
  checkIn: '#22D3EE',
  exercise: '#22C55E',
  mind: '#A78BFA',
  journal: '#F472B6',
  pulse: '#F59E0B',
  storm: '#EF4444',
  badge: '#F5C542',
};

interface XpBreakdownChartProps {
  xpBreakdown: ReturnType<typeof useGamification>['xpBreakdown'];
}

export default function XpBreakdownChart({ xpBreakdown }: XpBreakdownChartProps) {
  const data = [
    { name: 'Check-ins', value: xpBreakdown.checkIn, color: COLORS.checkIn },
    { name: 'Exercise', value: xpBreakdown.exerciseReached80 + xpBreakdown.exerciseReached100, color: COLORS.exercise },
    { name: 'Mind sessions', value: xpBreakdown.mindSession, color: COLORS.mind },
    { name: 'Journal', value: xpBreakdown.journalEntry, color: COLORS.journal },
    { name: 'Pulse checks', value: xpBreakdown.weeklyPulse, color: COLORS.pulse },
    { name: 'Storm shelter', value: xpBreakdown.stormSheltered, color: COLORS.storm },
    { name: 'Badge bonuses', value: xpBreakdown.badgeBonuses, color: COLORS.badge },
  ];

  return (
    <section
      aria-labelledby="xp-breakdown-title"
      className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6"
    >
      <h2 id="xp-breakdown-title" className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-4">
        XP Breakdown
      </h2>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
            <XAxis
              type="number"
              tick={{ fill: '#8A97B5', fontSize: 11 }}
              stroke="var(--color-border)"
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#8A97B5', fontSize: 11 }}
              stroke="var(--color-border)"
              width={100}
            />
            <Tooltip
              cursor={{ fill: 'rgba(34, 211, 238, 0.06)' }}
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                color: 'var(--color-text)',
                fontSize: 12,
              }}
              formatter={(value) => [`${value} XP`, 'Earned']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-space-muted mt-3 leading-relaxed">
        XP rewards effort and honest logging, not health values.
      </p>
    </section>
  );
}
