import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, ArrowRight, CircleCheck } from 'lucide-react';
import { useWellbeing } from '@/context/WellbeingContext';
import { useRecords } from '@/context/RecordsContext';

const STEPS = [
  { count: 5, sense: 'things you see', prompt: 'Look around and name 5 things you can see.' },
  { count: 4, sense: 'things you can touch', prompt: 'Notice 4 things you can feel or touch right now.' },
  { count: 3, sense: 'things you hear', prompt: 'Listen for 3 sounds around you.' },
  { count: 2, sense: 'things you smell', prompt: 'Identify 2 scents you can pick up.' },
  { count: 1, sense: 'thing you taste', prompt: 'Notice 1 taste in your mouth or take a sip of water.' },
] as const;

export default function GroundingExercise() {
  const { addSession } = useWellbeing();
  const { latestRecord } = useRecords();
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  const next = () => {
    if (step + 1 >= STEPS.length) {
      addSession('grounding', 60, latestRecord.missionDay);
      setDone(true);
    } else {
      setStep(step + 1);
    }
  };

  const reset = () => {
    setStep(0);
    setStarted(false);
    setDone(false);
  };

  return (
    <div className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 shrink-0">
          <Hand className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-space-text">Grounding (5-4-3-2-1)</h3>
          <p className="text-xs text-space-muted">Reconnect with your senses</p>
        </div>
      </div>

      {!started ? (
        <>
          <p className="text-xs text-space-muted leading-relaxed mb-4">
            A technique to anchor yourself in the present moment using your five senses.
          </p>
          <button
            onClick={() => setStarted(true)}
            className="w-full px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm font-medium transition-all hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Start grounding
          </button>
        </>
      ) : done ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-status-normal/10 border border-status-normal/30 flex items-center justify-center mb-3">
            <CircleCheck className="w-6 h-6 text-status-normal" />
          </div>
          <p className="text-sm font-medium text-status-normal mb-3">Session complete</p>
          <button
            onClick={reset}
            className="text-xs text-space-muted hover:text-space-text transition-colors"
          >
            Start again
          </button>
        </motion.div>
      ) : (
        <div>
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-space-muted mb-2">
              <span>Step {step + 1} of {STEPS.length}</span>
            </div>
            <div className="h-1.5 rounded-full bg-space-border overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center py-4">
                <motion.p
                  key={STEPS[step].count}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="text-5xl font-bold text-accent tabular-nums mb-2"
                >
                  {STEPS[step].count}
                </motion.p>
                <p className="text-sm font-medium text-space-text">{STEPS[step].sense}</p>
                <p className="text-xs text-space-muted mt-2 max-w-xs mx-auto">{STEPS[step].prompt}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={next}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-space-bg text-sm font-semibold transition-all hover:shadow-[0_0_20px_var(--color-accent-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {step + 1 >= STEPS.length ? 'Finish' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
