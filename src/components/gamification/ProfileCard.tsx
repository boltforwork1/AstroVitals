import { motion } from 'framer-motion';
import { CalendarCheck, Dumbbell, Info, Trophy } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { crewMember } from '@/data/mockRecords';

export default function ProfileCard() {
  const { level, nextLevel, progressPercent, xpToNext, totalXp, streaks } = useGamification();
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <section
      aria-labelledby="profile-title"
      className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-5">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 shrink-0">
            <span className="text-lg font-bold text-accent">AR</span>
          </div>
          <div>
            <h2 id="profile-title" className="text-base font-semibold text-space-text">
              {crewMember.name}
            </h2>
            <p className="text-xs text-space-muted">{crewMember.role}</p>
            <div className="flex items-center gap-2 mt-2">
              <Trophy className="w-3.5 h-3.5" style={{ color: level.color }} />
              <span className="text-sm font-semibold" style={{ color: level.color }}>
                {level.name}
              </span>
            </div>
          </div>
        </div>

        {/* XP bar + total */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <span className="text-xs text-space-muted uppercase tracking-wider">
              {nextLevel ? `${xpToNext} XP to ${nextLevel.name}` : 'Max level reached'}
            </span>
            <span className="text-2xl font-bold text-space-text tabular-nums">{totalXp.toLocaleString()}</span>
          </div>
          <div className="h-2.5 rounded-full bg-space-border overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: level.color }}
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${Math.round(progressPercent)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          {nextLevel && (
            <p className="text-[11px] text-space-muted mt-1.5 leading-relaxed">{level.description}</p>
          )}
        </div>
      </div>

      {/* Streak chips */}
      <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-space-border">
        <StreakChip
          icon={CalendarCheck}
          label={`Check-in streak: ${streaks.checkInStreak}`}
          best={streaks.checkInBest}
        />
        <StreakChip
          icon={Dumbbell}
          label={`Exercise streak: ${streaks.exerciseStreak}`}
          best={streaks.exerciseBest}
        />
        {streaks.restDayUsed && (
          <div className="relative group">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-status-caution/10 border border-status-caution/30 text-status-caution">
              <Info className="w-3 h-3" />
              Rest day pass used
            </span>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-space-surface border border-space-border text-[11px] text-space-muted leading-relaxed whitespace-normal w-52 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
              One missed day per week does not break your streak. Rest matters too.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function StreakChip({
  icon: Icon,
  label,
  best,
}: {
  icon: typeof CalendarCheck;
  label: string;
  best: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-accent/10 border border-accent/20 text-accent">
      <Icon className="w-3 h-3" />
      {label}
      <span className="text-space-muted ml-1">best {best}</span>
    </span>
  );
}
