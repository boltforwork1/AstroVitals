import { motion } from 'framer-motion';
import { CircleCheck as CheckCircle2, TrendingUp, TrendingDown, Minus, ArrowRight, PersonStanding } from 'lucide-react';
import type { DailyRecord, IndicatorKey } from '@/types/health';
import { indicators } from '@/data/indicators';
import { calculateHealthScore, getScoreLabel } from '@/utils/score';
import { getStatus, statusColor } from '@/utils/status';

export interface FlaggedIndicator {
  key: IndicatorKey;
  message: string;
}

export function buildFlaggedIndicators(record: DailyRecord): FlaggedIndicator[] {
  const messages: FlaggedIndicator[] = [];
  (Object.keys(indicators) as IndicatorKey[]).forEach((key) => {
    const value = record[key];
    const status = getStatus(key, value);
    const ind = indicators[key];
    let message: string | null = null;
    if (status === 'critical') {
      message = `well outside the safe range — report this to the flight surgeon.`;
    } else if (status === 'caution') {
      if (value < ind.normalRange.min) message = `below target. Consider rest and recovery.`;
      else if (value > ind.normalRange.max) message = `above target. Keep an eye on it today.`;
      else message = `trending near the edge of its range.`;
    }
    if (message) {
      messages.push({
        key,
        message: `${ind.label} ${value}${ind.unit} — ${message}`,
      });
    }
  });
  return messages;
}

interface ResultScreenProps {
  record: DailyRecord;
  previousRecord: DailyRecord | null;
  onGoDashboard: () => void;
  onGoBodyMap: () => void;
  onEdit: () => void;
}

export default function ResultScreen({
  record,
  previousRecord,
  onGoDashboard,
  onGoBodyMap,
  onEdit,
}: ResultScreenProps) {
  const score = calculateHealthScore(record);
  const { label, color } = getScoreLabel(score);
  const prevScore = previousRecord ? calculateHealthScore(previousRecord) : score;
  const delta = score - prevScore;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (score / 100) * circumference;

  const flagged = buildFlaggedIndicators(record);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Success check + ring */}
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-status-normal/10 border border-status-normal/30 mb-2"
        >
          <CheckCircle2 className="w-7 h-7 text-status-normal" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold tracking-tight text-space-text"
        >
          Check-in saved
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-space-muted mt-1"
        >
          Mission Day {record.missionDay} · {record.date}
        </motion.p>

        {/* Score ring */}
        <div className="relative w-44 h-44 mt-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="8" />
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
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.35 }}
              style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-4xl font-bold text-space-text tabular-nums"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {score}
            </motion.span>
            <span className="text-xs font-medium mt-1" style={{ color }}>
              {label}
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-4 flex items-center gap-2 text-sm"
        >
          <span className="text-space-muted">vs yesterday:</span>
          {delta > 0 ? (
            <span className="inline-flex items-center gap-1 text-status-normal font-medium">
              <TrendingUp className="w-3.5 h-3.5" />+{delta} points
            </span>
          ) : delta < 0 ? (
            <span className="inline-flex items-center gap-1 text-status-caution font-medium">
              <TrendingDown className="w-3.5 h-3.5" />
              {delta} points
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-space-muted font-medium">
              <Minus className="w-3.5 h-3.5" />
              no change
            </span>
          )}
        </motion.div>
      </div>

      {/* Flagged indicators */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="bg-space-surface border border-space-border rounded-xl p-5"
      >
        <h2 className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-3">
          What stands out
        </h2>
        {flagged.length === 0 ? (
          <p className="text-sm text-status-normal">
            Everything is within its target range. Nice work.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {flagged.map((f, i) => {
              const ind = indicators[f.key];
              const status = getStatus(f.key, record[f.key]);
              const c = statusColor(status);
              return (
                <motion.li
                  key={f.key}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + i * 0.08 }}
                  className="flex items-start gap-2.5"
                >
                  <span
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}80` }}
                  />
                  <span className="text-sm text-space-muted leading-relaxed">{f.message}</span>
                </motion.li>
              );
            })}
          </ul>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <button
          onClick={onGoDashboard}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-space-bg text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_var(--color-accent-glow)]"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onGoBodyMap}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm font-medium transition-colors hover:bg-accent/20"
        >
          <PersonStanding className="w-4 h-4" />
          View Body Map
        </button>
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-space-surface border border-space-border text-space-muted text-sm font-medium transition-colors hover:text-space-text hover:border-space-muted/50"
        >
          Edit check-in
        </button>
      </motion.div>
    </div>
  );
}
