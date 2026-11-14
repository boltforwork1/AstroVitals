import type { ExerciseCategory, ExerciseTarget, Intensity } from '@/data/exercises';
import { CATEGORY_META, INTENSITY_META, TARGET_META } from './trainingMeta';

export function CategoryIcon({ category, className = 'w-4 h-4' }: { category: ExerciseCategory; className?: string }) {
  const Icon = CATEGORY_META[category].icon;
  return <Icon className={className} aria-hidden="true" />;
}

export function IntensityBadge({ intensity }: { intensity: Intensity }) {
  const { label, color } = INTENSITY_META[intensity];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border"
      style={{ color, borderColor: `${color}55`, backgroundColor: `${color}15` }}
    >
      {label} intensity
    </span>
  );
}

export function TargetChips({ targets }: { targets: ExerciseTarget[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {targets.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium text-space-text bg-space-border/40"
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TARGET_META[t].color }} />
          {TARGET_META[t].label}
        </span>
      ))}
    </div>
  );
}
