import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { EXERCISE_BY_ID } from '@/data/exercises';
import type { PlanItem, PlanRole } from '@/utils/trainingPlan';
import { CategoryIcon, IntensityBadge, TargetChips } from './ExerciseMeta';
import WhyPlan from './WhyPlan';

const ROLE_LABEL: Record<PlanRole, string> = {
  warmup: 'Warm-up',
  main: 'Strength and conditioning',
  mood: 'Mood boost',
  stretch: 'Cool-down',
  extra: 'Added by you',
};

interface TodaysPlanCardProps {
  planItems: PlanItem[];
  extraItems: PlanItem[];
  targetMinutes: number;
  plannedTotal: number;
  loggedToday: number;
  reasons: string[];
  onRemoveExtra: (index: number) => void;
}

export default function TodaysPlanCard({
  planItems,
  extraItems,
  targetMinutes,
  plannedTotal,
  loggedToday,
  reasons,
  onRemoveExtra,
}: TodaysPlanCardProps) {
  const [doneKeys, setDoneKeys] = useState<Set<number>>(new Set());
  const allItems = [...planItems, ...extraItems];

  const toggleDone = (index: number) => {
    setDoneKeys((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <section
      aria-labelledby="todays-plan-title"
      className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h2 id="todays-plan-title" className="text-base font-semibold text-space-text">
            Today&apos;s plan
          </h2>
          <p className="text-xs text-space-muted mt-0.5">
            Tick off each exercise as you go. Minutes are only logged in a guided workout.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Stat label="Planned" value={`${plannedTotal} min`} sub={`Target ${targetMinutes}`} />
          <Stat label="Logged today" value={`${loggedToday} min`} />
        </div>
      </div>

      <ol className="space-y-2.5">
        {allItems.map((item, index) => {
          const exercise = EXERCISE_BY_ID[item.exerciseId];
          const done = doneKeys.has(index);
          const extraIndex = index - planItems.length;
          const isExtra = extraIndex >= 0;
          return (
            <li
              key={`${item.exerciseId}-${index}`}
              className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors duration-200 ${
                done ? 'border-status-normal bg-space-bg' : 'border-space-border bg-space-bg'
              }`}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={done}
                aria-label={`Mark ${exercise.name} as done`}
                onClick={() => toggleDone(index)}
                className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-md border shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                  done ? 'bg-status-normal border-status-normal text-space-bg' : 'border-space-muted hover:border-accent'
                }`}
              >
                {done && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
              </button>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className={`inline-flex items-center gap-2 text-sm font-medium ${done ? 'text-space-muted line-through' : 'text-space-text'}`}>
                    <span className="text-accent">
                      <CategoryIcon category={exercise.category} />
                    </span>
                    {exercise.name}
                  </span>
                  <span className="text-sm text-space-muted tabular-nums">{item.minutes} min</span>
                  <IntensityBadge intensity={item.intensity} />
                  <span className="text-[11px] uppercase tracking-wider text-space-muted">
                    {ROLE_LABEL[item.role]}
                  </span>
                </div>
                <TargetChips targets={exercise.targets} />
              </div>

              {isExtra && (
                <button
                  type="button"
                  onClick={() => onRemoveExtra(extraIndex)}
                  aria-label={`Remove ${exercise.name} from today's plan`}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-space-muted hover:text-space-text hover:bg-space-border/50 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-5 pt-4 border-t border-space-border">
        <WhyPlan reasons={reasons} />
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wider text-space-muted">{label}</span>
      <span className="text-lg font-semibold text-space-text tabular-nums">{value}</span>
      {sub && <span className="text-[11px] text-space-muted tabular-nums">{sub}</span>}
    </div>
  );
}
