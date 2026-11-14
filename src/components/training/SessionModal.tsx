import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, SkipForward, Trophy, X, Zap } from 'lucide-react';
import { EXERCISE_BY_ID } from '@/data/exercises';
import type { PlanItem } from '@/utils/trainingPlan';
import { CategoryIcon, IntensityBadge, TargetChips } from './ExerciseMeta';
import ModalShell from './ModalShell';

const MS_PER_MINUTE = 60_000;
const MS_PER_MINUTE_DEMO = 3_000;
const TICK_MS = 100;

interface SessionModalProps {
  items: PlanItem[];
  onLogMinutes: (minutes: number) => void;
  onClose: () => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function SessionModal({ items, onLogMinutes, onClose }: SessionModalProps) {
  const titleId = useId();
  const [index, setIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [paused, setPaused] = useState(false);
  const [demoSpeed, setDemoSpeed] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [loggedMinutes, setLoggedMinutes] = useState(0);

  const finished = index >= items.length;
  const current = finished ? undefined : items[index];
  const msPerMinute = demoSpeed ? MS_PER_MINUTE_DEMO : MS_PER_MINUTE;
  const durationMs = current ? current.minutes * msPerMinute : 0;
  const exercise = current ? EXERCISE_BY_ID[current.exerciseId] : undefined;
  const progress = finished ? 1 : durationMs > 0 ? Math.min(1, elapsedMs / durationMs) : 0;
  const overall = Math.min(1, (index + progress) / items.length);

  useEffect(() => {
    if (finished || paused) return;
    const id = window.setInterval(() => setElapsedMs((ms) => ms + TICK_MS), TICK_MS);
    return () => window.clearInterval(id);
  }, [finished, paused]);

  useEffect(() => {
    if (finished || paused || !current || elapsedMs < durationMs) return;
    onLogMinutes(current.minutes);
    setCompletedCount((c) => c + 1);
    setLoggedMinutes((m) => m + current.minutes);
    setElapsedMs(0);
    setIndex((i) => i + 1);
  }, [elapsedMs, durationMs, finished, paused, current, onLogMinutes]);

  const skipCurrent = () => {
    setElapsedMs(0);
    setIndex((i) => i + 1);
  };

  const finishEarly = () => {
    if (!current) return;
    onLogMinutes(current.minutes);
    setCompletedCount((c) => c + 1);
    setLoggedMinutes((m) => m + current.minutes);
    setElapsedMs(0);
    setIndex((i) => i + 1);
  };

  const toggleDemo = () => {
    setDemoSpeed((d) => !d);
    setElapsedMs(0);
  };

  return (
    <ModalShell titleId={titleId} onClose={onClose} maxWidthClass="max-w-xl">
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-space-border">
        <div>
          <h2 id={titleId} className="text-lg font-semibold text-space-text">
            {finished ? 'Workout complete' : 'Guided workout'}
          </h2>
          <p className="text-xs text-space-muted mt-0.5" aria-live="polite">
            {finished ? 'Nice work today.' : `Exercise ${index + 1} of ${items.length}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close workout"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-space-muted hover:text-space-text hover:bg-space-border/50 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="px-5 sm:px-6 pt-4">
        <div
          role="progressbar"
          aria-label="Whole workout progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(overall * 100)}
          className="h-1.5 w-full rounded-full bg-space-border overflow-hidden"
        >
          <motion.div
            className="h-full bg-accent rounded-full"
            animate={{ width: `${overall * 100}%` }}
            transition={{ duration: 0.2, ease: 'linear' }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {finished ? (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="p-5 sm:p-6 space-y-6"
          >
            <div className="flex flex-col items-center text-center gap-3 pt-2">
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl"
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)' }}
              >
                <Trophy className="w-7 h-7 text-status-normal" aria-hidden="true" />
              </div>
              <p className="text-sm text-space-muted leading-relaxed max-w-sm">
                {completedCount === items.length
                  ? 'Every exercise is done. Your bones, muscles, and heart all benefited from that loading.'
                  : completedCount > 0
                    ? 'Good work. Every minute of loading counts up there.'
                    : 'No worries. Come back when you are ready, even a short session helps.'}
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-3">
              <SummaryStat label="Minutes logged" value={`${loggedMinutes}`} />
              <SummaryStat label="Completed" value={`${completedCount}`} />
              <SummaryStat label="Skipped" value={`${items.length - completedCount}`} />
            </dl>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-accent text-space-bg text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-accent"
              >
                Done
              </button>
            </div>
          </motion.div>
        ) : (
          current &&
          exercise && (
            <motion.div
              key={`${index}-${current.exerciseId}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="p-5 sm:p-6 space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-glow text-accent shrink-0">
                    <CategoryIcon category={exercise.category} className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-space-text">{exercise.name}</h3>
                    <p className="text-xs text-space-muted tabular-nums">{current.minutes} min planned</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <IntensityBadge intensity={current.intensity} />
                  <TargetChips targets={exercise.targets} />
                </div>
                <p className="text-sm text-space-muted leading-relaxed">{exercise.instructions}</p>
              </div>

              <div className="flex flex-col items-center gap-2 py-4 rounded-xl border border-space-border bg-space-bg/60">
                <span className="text-[11px] uppercase tracking-wider text-space-muted">
                  {paused ? 'Paused' : 'Time left'}
                </span>
                <span
                  role="timer"
                  aria-live="off"
                  className="text-5xl font-bold text-space-text tabular-nums"
                >
                  {formatTime(durationMs - elapsedMs)}
                </span>
                <div className="w-full max-w-xs h-1 rounded-full bg-space-border overflow-hidden">
                  <div className="h-full bg-accent transition-[width] duration-100 ease-linear" style={{ width: `${progress * 100}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-space-border text-sm font-medium text-space-text hover:bg-space-border/40 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {paused ? <Play className="w-4 h-4" aria-hidden="true" /> : <Pause className="w-4 h-4" aria-hidden="true" />}
                  {paused ? 'Resume' : 'Pause'}
                </button>
                <button
                  type="button"
                  onClick={skipCurrent}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-space-border text-sm font-medium text-space-muted hover:text-space-text hover:bg-space-border/40 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <SkipForward className="w-4 h-4" aria-hidden="true" />
                  Skip
                </button>
                <button
                  type="button"
                  onClick={finishEarly}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-accent text-space-bg text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Next
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-space-border">
                <span className="text-xs text-space-muted">Demo speed: 1 minute lasts 3 seconds</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={demoSpeed}
                  onClick={toggleDemo}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                    demoSpeed ? 'border-accent text-accent' : 'border-space-border text-space-muted hover:text-space-text'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                  Demo speed {demoSpeed ? 'on' : 'off'}
                </button>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </ModalShell>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-lg border border-space-border bg-space-bg">
      <dt className="text-[11px] uppercase tracking-wider text-space-muted text-center">{label}</dt>
      <dd className="text-2xl font-bold text-space-text tabular-nums">{value}</dd>
    </div>
  );
}
