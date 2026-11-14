import { useId } from 'react';
import { Plus, Check } from 'lucide-react';
import type { Exercise } from '@/data/exercises';
import { CategoryIcon, IntensityBadge, TargetChips } from './ExerciseMeta';
import ModalShell from './ModalShell';
import { CATEGORY_META } from './trainingMeta';

interface ExerciseDetailModalProps {
  exercise: Exercise;
  inPlan: boolean;
  onAdd: () => void;
  onClose: () => void;
}

export default function ExerciseDetailModal({ exercise, inPlan, onAdd, onClose }: ExerciseDetailModalProps) {
  const titleId = useId();

  return (
    <ModalShell titleId={titleId} onClose={onClose}>
      <div className="flex items-start gap-3 p-5 sm:p-6 border-b border-space-border">
        <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-accent-glow text-accent shrink-0">
          <CategoryIcon category={exercise.category} className="w-5 h-5" />
        </span>
        <div className="min-w-0 space-y-1.5">
          <h2 id={titleId} className="text-lg font-semibold text-space-text">
            {exercise.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-space-muted">{CATEGORY_META[exercise.category].label}</span>
            <span className="text-xs text-space-muted tabular-nums">· {exercise.defaultMinutes} min</span>
            <IntensityBadge intensity={exercise.intensity} />
          </div>
          <TargetChips targets={exercise.targets} />
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-space-text mb-1.5">How to do it</h3>
          <p className="text-sm text-space-muted leading-relaxed">{exercise.instructions}</p>
        </div>
        <div className="rounded-lg border border-space-border bg-space-bg p-4">
          <h3 className="text-sm font-semibold text-space-text mb-1.5">Why it matters in space</h3>
          <p className="text-sm text-space-muted leading-relaxed">{exercise.whyInSpace}</p>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 border-t border-space-border">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-medium text-space-muted hover:text-space-text hover:bg-space-border/40 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onAdd}
          disabled={inPlan}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-space-bg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-accent"
        >
          {inPlan ? <Check className="w-4 h-4" aria-hidden="true" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
          {inPlan ? 'Already in today\u2019s plan' : 'Add to today\u2019s plan'}
        </button>
      </div>
    </ModalShell>
  );
}
