import { DAILY_TARGET_MINUTES } from '@/utils/trainingPlan';
import type { WeekDay } from '@/utils/trainingStats';
import ProgressRing from './ProgressRing';
import StreakCounter from './StreakCounter';
import WeeklyExerciseChart from './WeeklyExerciseChart';

interface ProgressRowProps {
  loggedToday: number;
  targetMinutes: number;
  weekDays: WeekDay[];
  streak: number;
}

export default function ProgressRow({ loggedToday, targetMinutes, weekDays, streak }: ProgressRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <section
        aria-labelledby="progress-today-title"
        className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6 flex flex-col items-center"
      >
        <h2 id="progress-today-title" className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-4 self-start">
          Today
        </h2>
        <ProgressRing logged={loggedToday} target={targetMinutes} />
      </section>

      <section
        aria-labelledby="progress-week-title"
        className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6 md:col-span-2 lg:col-span-2"
      >
        <div className="flex items-baseline justify-between gap-3 mb-4">
          <h2 id="progress-week-title" className="text-sm font-semibold text-space-muted uppercase tracking-wider">
            Last 7 days
          </h2>
          <span className="text-xs text-space-muted">Bars in cyan met the 80% goal</span>
        </div>
        <WeeklyExerciseChart days={weekDays} target={DAILY_TARGET_MINUTES} />
      </section>

      <section
        aria-labelledby="progress-streak-title"
        className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6 md:col-span-2 lg:col-span-1"
      >
        <h2 id="progress-streak-title" className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-4">
          Streak
        </h2>
        <StreakCounter streak={streak} />
      </section>
    </div>
  );
}
