import { useId, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { EXERCISES, EXERCISE_BY_ID, type Exercise, type ExerciseCategory, type ExerciseId } from '@/data/exercises';
import { CATEGORY_META } from './trainingMeta';
import { CategoryIcon, IntensityBadge, TargetChips } from './ExerciseMeta';
import ExerciseDetailModal from './ExerciseDetailModal';

type Filter = 'all' | ExerciseCategory;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'resistance', label: CATEGORY_META.resistance.label },
  { value: 'cardio', label: CATEGORY_META.cardio.label },
  { value: 'balance', label: CATEGORY_META.balance.label },
  { value: 'flexibility', label: CATEGORY_META.flexibility.label },
];

interface ExerciseLibraryProps {
  planExerciseIds: ExerciseId[];
  onAdd: (id: ExerciseId) => void;
}

export default function ExerciseLibrary({ planExerciseIds, onAdd }: ExerciseLibraryProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<ExerciseId | null>(null);
  const headingId = useId();
  const visible = EXERCISES.filter((e) => filter === 'all' || e.category === filter);

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 id={headingId} className="text-sm font-semibold text-space-muted uppercase tracking-wider">
            Exercise library
          </h2>
          <p className="text-xs text-space-muted mt-1">Open an exercise to see how to do it and why it matters in orbit.</p>
        </div>
        <div role="group" aria-label="Filter exercises by category" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                  active
                    ? 'border-accent text-accent bg-accent-glow'
                    : 'border-space-border text-space-muted hover:text-space-text hover:border-space-muted'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map((exercise) => (
          <li key={exercise.id}>
            <ExerciseCard exercise={exercise} onOpen={() => setSelectedId(exercise.id)} />
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {selectedId && (
          <ExerciseDetailModal
            key={selectedId}
            exercise={EXERCISE_BY_ID[selectedId]}
            inPlan={planExerciseIds.includes(selectedId)}
            onAdd={() => {
              onAdd(selectedId);
              setSelectedId(null);
            }}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function ExerciseCard({ exercise, onOpen }: { exercise: Exercise; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full h-full text-left bg-space-surface border border-space-border rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent-glow text-accent shrink-0">
          <CategoryIcon category={exercise.category} />
        </span>
        <span className="text-xs text-space-muted tabular-nums">{exercise.defaultMinutes} min</span>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-space-text group-hover:text-accent transition-colors">{exercise.name}</h3>
        <p className="text-xs text-space-muted">{CATEGORY_META[exercise.category].label}</p>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2">
        <IntensityBadge intensity={exercise.intensity} />
        <TargetChips targets={exercise.targets} />
      </div>
    </button>
  );
}
