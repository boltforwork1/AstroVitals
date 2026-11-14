import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind, Square } from 'lucide-react';
import { useWellbeing } from '@/context/WellbeingContext';
import { useRecords } from '@/context/RecordsContext';

const PHASES = ['Breathe in', 'Hold', 'Breathe out', 'Hold'] as const;
const PHASE_DURATION = 4000; // 4 seconds each for 4-4-4-4
const DURATIONS = [
  { label: '1 min', seconds: 60 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
];

export default function BreathingExercise() {
  const { addSession } = useWellbeing();
  const { latestRecord } = useRecords();
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(60);
  const [active, setActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState(0);
  const timerRef = useRef<number | null>(null);
  const phaseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    timerRef.current = window.setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= duration) {
          setActive(false);
          addSession('breathing', duration, latestRecord.missionDay);
          return duration;
        }
        return e + 1;
      });
    }, 1000);

    phaseTimerRef.current = window.setInterval(() => {
      setPhase((p) => (p + 1) % PHASES.length);
    }, PHASE_DURATION);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (phaseTimerRef.current) window.clearInterval(phaseTimerRef.current);
    };
  }, [active, duration, addSession, latestRecord.missionDay]);

  const start = (sec: number) => {
    setDuration(sec);
    setElapsed(0);
    setPhase(0);
    setActive(true);
  };

  const stop = () => {
    if (elapsed > 0) {
      addSession('breathing', elapsed, latestRecord.missionDay);
    }
    setActive(false);
    setOpen(false);
  };

  const remaining = duration - elapsed;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const scale = phase === 0 ? 1.4 : phase === 1 ? 1.4 : phase === 2 ? 0.7 : 0.7;

  return (
    <>
      <div className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 shrink-0">
            <Wind className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-space-text">Guided Breathing</h3>
            <p className="text-xs text-space-muted">4-4-4-4 box breathing pattern</p>
          </div>
        </div>
        <p className="text-xs text-space-muted leading-relaxed mb-4">
          A simple technique to calm the nervous system and refocus.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="w-full px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm font-medium transition-all hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Start breathing session
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-space-bg/95 backdrop-blur-sm" role="dialog" aria-modal="true">
            <button
              onClick={stop}
              aria-label="Stop and close"
              className="absolute top-6 right-6 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-space-muted border border-space-border hover:text-space-text hover:border-space-muted transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              Stop
            </button>

            {!active ? (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-space-text mb-2">Choose a duration</h2>
                <p className="text-sm text-space-muted mb-8">Box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s.</p>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.seconds}
                      onClick={() => start(d.seconds)}
                      className="px-6 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm font-semibold transition-all hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {d.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-4 text-xs text-space-muted hover:text-space-text transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-accent/10"
                    animate={{ scale }}
                    transition={{ duration: PHASE_DURATION / 1000, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute rounded-full border-2 border-accent/40"
                    style={{ width: 200, height: 200 }}
                    animate={{ scale }}
                    transition={{ duration: PHASE_DURATION / 1000, ease: 'easeInOut' }}
                  />
                  <div className="relative z-10 text-center">
                    <motion.p
                      key={phase}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-lg font-semibold text-space-text"
                    >
                      {PHASES[phase]}
                    </motion.p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-space-text tabular-nums">
                  {mins}:{String(secs).padStart(2, '0')}
                </p>
                <p className="text-xs text-space-muted mt-2">remaining</p>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
