import { motion } from 'framer-motion';
import { calculateHealthScore, getScoreLabel } from '@/utils/score';
import type { DailyRecord } from '@/types/health';

interface HealthScoreCardProps {
  todayRecord: DailyRecord;
  records: DailyRecord[];
}

export default function HealthScoreCard({ todayRecord, records }: HealthScoreCardProps) {
  const score = calculateHealthScore(todayRecord);
  const { label, color } = getScoreLabel(score);

  const last7 = records.slice(-7);
  const last7Avg = Math.round(
    last7.reduce((sum, r) => sum + calculateHealthScore(r), 0) / last7.length
  );

  const prevWeekStart = Math.max(0, records.length - 14);
  const prevWeek = records.slice(prevWeekStart, records.length - 7);
  const prevWeekAvg = prevWeek.length > 0
    ? Math.round(prevWeek.reduce((sum, r) => sum + calculateHealthScore(r), 0) / prevWeek.length)
    : last7Avg;

  const weekDelta = last7Avg - prevWeekAvg;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-space-surface border border-space-border rounded-xl p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-space-muted uppercase tracking-wider">
          Overall Health Score
        </h2>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="8"
            />
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeOffset }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
              style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-4xl font-bold text-space-text tabular-nums"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
            <span
              className="text-xs font-medium mt-1"
              style={{ color }}
            >
              {label}
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm">
          <span className="text-space-muted">vs last week:</span>
          {weekDelta > 0 ? (
            <span className="text-status-caution font-medium">+{weekDelta} pts</span>
          ) : weekDelta < 0 ? (
            <span className="text-status-normal font-medium">{weekDelta} pts</span>
          ) : (
            <span className="text-space-muted font-medium">no change</span>
          )}
        </div>
      </div>
    </div>
  );
}
