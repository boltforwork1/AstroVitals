import { useId, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { useRecords } from '@/context/RecordsContext';
import type { PlanItem } from '@/utils/trainingPlan';
import SessionModal from './SessionModal';

interface SessionRunnerProps {
  items: PlanItem[];
}

export default function SessionRunner({ items }: SessionRunnerProps) {
  const titleId = useId();
  const { latestRecord, updateRecord } = useRecords();
  const [sessionItems, setSessionItems] = useState<PlanItem[] | null>(null);

  const logMinutes = (minutes: number) => {
    updateRecord(latestRecord.missionDay, { exercise: latestRecord.exercise + minutes });
  };

  return (
    <section
      aria-labelledby={titleId}
      className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h2 id={titleId} className="text-base font-semibold text-space-text">
          Guided workout
        </h2>
        <p className="text-sm text-space-muted mt-1 max-w-xl leading-relaxed">
          Work through today&apos;s {items.length} exercises one at a time with a timer. Minutes are logged as each
          exercise finishes, and skipped exercises are not counted.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setSessionItems(items)}
        disabled={items.length === 0}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-space-bg text-sm font-semibold shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-accent"
      >
        <Play className="w-4 h-4" aria-hidden="true" />
        Start workout
      </button>

      <AnimatePresence>
        {sessionItems && (
          <SessionModal
            items={sessionItems}
            onLogMinutes={logMinutes}
            onClose={() => setSessionItems(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
