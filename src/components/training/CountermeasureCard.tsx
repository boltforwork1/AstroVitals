import { getRegionStatus } from '@/utils/regionStatus';
import { statusColor } from '@/utils/status';
import type { DailyRecord } from '@/types/health';
import { EXERCISES } from '@/data/exercises';
import type { Countermeasure } from '@/data/countermeasures';

const STATUS_LABEL = {
  normal: 'On track',
  caution: 'Watch',
  critical: 'Action needed',
} as const;

interface CountermeasureCardProps {
  countermeasure: Countermeasure;
  record: DailyRecord;
}

export default function CountermeasureCard({ countermeasure, record }: CountermeasureCardProps) {
  const { regionId, target, title, icon: Icon, statusLine, whyExerciseHelps } = countermeasure;
  const { score, status } = getRegionStatus(regionId, record);
  const color = statusColor(status);
  const targeting = EXERCISES.filter((e) => e.targets.includes(target));

  return (
    <article
      aria-labelledby={`countermeasure-${regionId}`}
      className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6 flex flex-col gap-4 transition-colors hover:border-accent/40"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color }} aria-hidden="true" />
          </span>
          <h2 id={`countermeasure-${regionId}`} className="text-base font-semibold text-space-text">
            {title}
          </h2>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
          style={{ color, backgroundColor: `${color}15` }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
          {STATUS_LABEL[status]} · {score}
        </span>
      </header>

      <p className="text-sm font-medium text-space-text">{statusLine[status]}</p>
      <p className="text-sm text-space-muted leading-relaxed">{whyExerciseHelps}</p>

      <div className="mt-auto pt-4 border-t border-space-border">
        <p className="text-[11px] uppercase tracking-wider text-space-muted mb-2">Exercises that target this</p>
        <ul className="flex flex-wrap gap-1.5">
          {targeting.map((e) => (
            <li key={e.id} className="px-2 py-0.5 rounded-md text-xs text-space-text bg-space-bg border border-space-border">
              {e.name}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
