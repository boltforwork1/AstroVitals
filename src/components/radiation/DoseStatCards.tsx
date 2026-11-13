import { motion } from 'framer-motion';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { DailyRecord } from '@/types/health';
import { average, percentChange } from '@/utils/radiation';

interface DoseStatCardsProps {
  records: DailyRecord[];
}

export default function DoseStatCards({ records }: DoseStatCardsProps) {
  const doses = records.map((r) => r.radiationDose);
  const today = records[records.length - 1].radiationDose;
  const priorSevenAverage = average(doses.slice(-8, -1));
  const missionAverage = average(doses);
  const lastSevenAverage = average(doses.slice(-7));
  const previousSevenAverage = average(doses.slice(-14, -7));

  const cards = [
    {
      label: "Today's dose",
      value: today,
      note: 'Latest check-in day',
      trend: percentChange(today, priorSevenAverage),
      trendLabel: 'vs prior 7-day average',
    },
    {
      label: 'Average per day',
      value: missionAverage,
      note: 'Mission so far',
      trend: percentChange(lastSevenAverage, missionAverage),
      trendLabel: 'last 7 days vs mission',
    },
    {
      label: 'Last 7 days average',
      value: lastSevenAverage,
      note: 'Per day',
      trend: percentChange(lastSevenAverage, previousSevenAverage),
      trendLabel: 'vs previous 7 days',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
          className="flex flex-col bg-space-surface border border-space-border rounded-xl p-5"
        >
          <p className="text-xs font-medium text-space-muted uppercase tracking-wider">{card.label}</p>
          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="text-3xl font-bold text-space-text tabular-nums">
              {card.value === null ? '—' : card.value.toFixed(2)}
            </span>
            <span className="text-xs text-space-muted">mSv</span>
          </div>
          <p className="text-xs text-space-muted mt-1">{card.note}</p>
          <div className="mt-auto pt-4">
            <TrendBadge percent={card.trend} label={card.trendLabel} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TrendBadge({ percent, label }: { percent: number | null; label: string }) {
  if (percent === null) {
    return <span className="text-xs text-space-muted">No comparison yet</span>;
  }
  const rounded = Math.round(Math.abs(percent) * 10) / 10;
  if (rounded === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-space-muted">
        <Minus className="w-3 h-3" />
        flat <span className="font-normal">{label}</span>
      </span>
    );
  }
  const up = percent > 0;
  return (
    <span
      className={`inline-flex flex-wrap items-center gap-1 text-xs font-medium ${
        up ? 'text-status-caution' : 'text-status-normal'
      }`}
    >
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {rounded}%
      <span className="font-normal text-space-muted">{label}</span>
    </span>
  );
}
