import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { STREAK_RATIO } from '@/utils/trainingStats';

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full gap-1">
      <motion.div
        animate={streak > 0 ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 2, repeat: streak > 0 ? Infinity : 0, ease: 'easeInOut' }}
        className="flex items-center justify-center w-12 h-12 rounded-xl mb-2"
        style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)' }}
        aria-hidden="true"
      >
        <Flame className="w-6 h-6 text-status-caution" />
      </motion.div>
      <span className="text-4xl font-bold text-space-text tabular-nums">{streak}</span>
      <span className="text-sm text-space-muted">
        {streak === 1 ? 'day' : 'days'} in a row
      </span>
      <p className="text-xs text-space-muted mt-3 max-w-[220px] leading-relaxed">
        Days at or above {Math.round(STREAK_RATIO * 100)}% of the daily target.
      </p>
    </div>
  );
}
