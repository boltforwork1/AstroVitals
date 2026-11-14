import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useWellbeing } from '@/context/WellbeingContext';
import { useRecords } from '@/context/RecordsContext';

const QUESTIONS = [
  'How is your energy level today?',
  'How connected do you feel to the crew?',
  'How connected do you feel to home?',
  'How motivated are you for mission tasks?',
  'How would you rate your stress level?',
] as const;

const OPTIONS = [
  { value: 1, label: 'Very low' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Very good' },
];

function scoreLabel(score: number): { label: string; color: string; suggestions: string[] } {
  if (score >= 70) {
    return {
      label: 'Good',
      color: '#22C55E',
      suggestions: [
        'Keep up your sleep schedule and exercise routine.',
        'Check in with a crew member to maintain social connection.',
      ],
    };
  }
  if (score >= 40) {
    return {
      label: 'Keep an eye on it',
      color: '#F59E0B',
      suggestions: [
        'Take a short break for breathing or grounding exercises.',
        'Plan a crew connection activity in the next day or two.',
        'Review your sleep schedule and adjust if needed.',
      ],
    };
  }
  return {
    label: 'Reach out for support',
    color: '#EF4444',
    suggestions: [
      'Talk to the crew or ground support today.',
      'Use a guided breathing session before your next task.',
      'Review your workload and rest with the mission team.',
    ],
  };
}

export default function PulseCheck() {
  const { pulseResults, addPulseResult } = useWellbeing();
  const { latestRecord } = useRecords();
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const startCheck = () => {
    setAnswers([]);
    setCurrent(0);
    setShowResult(false);
    setOpen(true);
  };

  const selectOption = (value: number) => {
    const next = [...answers, value];
    setAnswers(next);
    if (next.length === QUESTIONS.length) {
      const raw = next.reduce((s, v, i) => s + (i === 4 ? 6 - v : v), 0);
      const max = QUESTIONS.length * 5;
      const score = Math.round((raw / max) * 100);
      addPulseResult(next, score, latestRecord.missionDay);
      setShowResult(true);
    } else {
      setCurrent(current + 1);
    }
  };

  const score = showResult ? Math.round((answers.reduce((s, v, i) => s + (i === 4 ? 6 - v : v), 0) / (QUESTIONS.length * 5)) * 100) : 0;
  const result = scoreLabel(score);

  const chartData = pulseResults.slice(-20).map((p) => ({ day: p.missionDay, score: p.score }));

  return (
    <>
      <div className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-space-text">Weekly Wellbeing Pulse</h2>
            <p className="text-xs text-space-muted mt-0.5">A 5-question self-check</p>
          </div>
          <button
            onClick={startCheck}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-accent text-space-bg transition-all hover:shadow-[0_0_20px_var(--color-accent-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Play className="w-3.5 h-3.5" />
            Start
          </button>
        </div>

        {chartData.length > 0 ? (
          <div className="h-[100px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#8A97B5', fontSize: 10 }}
                  tickFormatter={(d: number) => `D${d}`}
                  stroke="var(--color-border)"
                  minTickGap={20}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#8A97B5', fontSize: 10 }}
                  stroke="var(--color-border)"
                  width={30}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#22D3EE"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#22D3EE' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-space-muted py-4">No pulse checks yet. Start your first one above.</p>
        )}

        <p className="text-[11px] text-space-muted mt-3">A simple self-check, not a clinical test.</p>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-space-surface border border-space-border rounded-xl shadow-2xl"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-lg text-space-muted hover:text-space-text hover:bg-space-border/50 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {!showResult ? (
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-space-muted mb-2">
                      <span>Question {current + 1} of {QUESTIONS.length}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-space-border overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-base font-semibold text-space-text mb-4">
                        {QUESTIONS[current]}
                      </h3>
                      <div className="space-y-2">
                        {OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => selectOption(opt.value)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-space-border bg-space-bg/40 hover:border-accent/40 hover:bg-accent/5 text-left text-sm text-space-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            <span className="w-7 h-7 rounded-full bg-space-border/60 flex items-center justify-center text-xs font-bold text-space-muted shrink-0">
                              {opt.value}
                            </span>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${result.color}15`, border: `2px solid ${result.color}40` }}
                  >
                    <span className="text-2xl font-bold tabular-nums" style={{ color: result.color }}>
                      {score}
                    </span>
                  </motion.div>
                  <h3 className="text-lg font-semibold text-space-text">{result.label}</h3>
                  <p className="text-xs text-space-muted mt-1">out of 100</p>

                  <div className="text-left mt-5 space-y-2">
                    {result.suggestions.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="flex items-start gap-2 text-sm text-space-muted"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        {s}
                      </motion.div>
                    ))}
                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    className="mt-6 w-full px-4 py-2.5 rounded-xl bg-accent text-space-bg text-sm font-semibold transition-all hover:shadow-[0_0_20px_var(--color-accent-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
