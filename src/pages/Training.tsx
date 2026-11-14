import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRecords } from '@/context/RecordsContext';
import { COUNTERMEASURES } from '@/data/countermeasures';
import type { ExerciseId } from '@/data/exercises';
import { extraPlanItem, generatePlan, type PlanItem } from '@/utils/trainingPlan';
import { lastWeekMinutes, onTrackStreak } from '@/utils/trainingStats';
import TodaysPlanCard from '@/components/training/TodaysPlanCard';
import ProgressRow from '@/components/training/ProgressRow';
import SessionRunner from '@/components/training/SessionRunner';
import CountermeasureCard from '@/components/training/CountermeasureCard';
import ExerciseLibrary from '@/components/training/ExerciseLibrary';

export default function Training() {
  const { records, latestRecord } = useRecords();
  const plan = useMemo(() => generatePlan(records), [records]);
  const weekDays = useMemo(() => lastWeekMinutes(records), [records]);
  const streak = useMemo(() => onTrackStreak(records), [records]);
  const [extraItems, setExtraItems] = useState<PlanItem[]>([]);

  const allItems = [...plan.items, ...extraItems];
  const plannedTotal = allItems.reduce((sum, item) => sum + item.minutes, 0);
  const planExerciseIds = allItems.map((item) => item.exerciseId);

  const addExtra = (exerciseId: ExerciseId) => {
    setExtraItems((prev) => [...prev, extraPlanItem(exerciseId)]);
  };
  const removeExtra = (index: number) => {
    setExtraItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-space-text">Training & Countermeasures</h1>
        <p className="text-sm text-space-muted mt-0.5">
          In microgravity bones and muscles are not loaded, so exercise is part of the job.
        </p>
      </motion.div>

      <TodaysPlanCard
        planItems={plan.items}
        extraItems={extraItems}
        targetMinutes={plan.targetMinutes}
        plannedTotal={plannedTotal}
        loggedToday={latestRecord.exercise}
        reasons={plan.reasons}
        onRemoveExtra={removeExtra}
      />

      <ProgressRow
        loggedToday={latestRecord.exercise}
        targetMinutes={plan.targetMinutes}
        weekDays={weekDays}
        streak={streak}
      />

      <SessionRunner items={allItems} />

      <section aria-labelledby="countermeasures-title" className="space-y-4">
        <div>
          <h2 id="countermeasures-title" className="text-sm font-semibold text-space-muted uppercase tracking-wider">
            Countermeasures
          </h2>
          <p className="text-xs text-space-muted mt-1">How exercise protects each part of the body, based on today&apos;s readings.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COUNTERMEASURES.map((countermeasure) => (
            <CountermeasureCard key={countermeasure.regionId} countermeasure={countermeasure} record={latestRecord} />
          ))}
        </div>
      </section>

      <ExerciseLibrary planExerciseIds={planExerciseIds} onAdd={addExtra} />

      <footer className="pt-6 border-t border-space-border">
        <p className="text-xs text-space-muted text-center leading-relaxed">
          General guidance only. Follow your mission exercise protocol and medical team&apos;s instructions.
        </p>
      </footer>
    </div>
  );
}
