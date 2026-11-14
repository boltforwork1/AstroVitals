import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useRecords } from '@/context/RecordsContext';

interface Milestone {
  day: number;
  label: string;
  tip: string;
}

const MILESTONES: Milestone[] = [
  { day: 30, label: 'First month', tip: 'Your body is adapting to microgravity. Keep up exercise to protect bones and muscles.' },
  { day: 60, label: 'Two months', tip: 'Sleep patterns may shift. Stick to a fixed sleep schedule and control cabin lighting.' },
  { day: 90, label: 'Halfway', tip: 'Mood dips are common at the midpoint. Plan something to look forward to and stay connected with crew.' },
  { day: 120, label: 'Final stretch', tip: 'Immune function may be altered. Prioritize sleep and hygiene to stay healthy.' },
  { day: 150, label: 'Almost home', tip: 'Start thinking about readaptation to gravity. Keep up exercise to ease the transition.' },
  { day: 180, label: 'Mission complete', tip: 'Maintain your fitness routine for a smoother return to Earth gravity.' },
];

const MISSION_LENGTH = 180;

export default function MissionTimeline() {
  const { latestRecord } = useRecords();
  const latestDay = latestRecord.missionDay;

  const lineStartPct = (MILESTONES[0].day / MISSION_LENGTH) * 100;
  const progressWidthPct = Math.max(0, (Math.min(latestDay, MISSION_LENGTH) - MILESTONES[0].day) / MISSION_LENGTH) * 100;
  const nextMilestone = MILESTONES.find((m) => latestDay < m.day);

  return (
    <section
      aria-labelledby="timeline-title"
      className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6"
    >
      <h2 id="timeline-title" className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-2">
        Mission Timeline
      </h2>
      <p className="text-xs text-space-muted mb-5">Mission Day {latestDay} of {MISSION_LENGTH}</p>

      <div className="overflow-x-auto pb-2">
        <div className="relative min-w-[760px]" style={{ height: '130px' }}>
          {/* Base line */}
          <div
            className="absolute h-0.5 rounded-full bg-space-border"
            style={{ top: '10px', left: `${lineStartPct}%`, right: 0 }}
          />
          {/* Progress line */}
          <motion.div
            className="absolute h-0.5 rounded-full bg-accent"
            style={{ top: '10px', left: `${lineStartPct}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressWidthPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Current position marker */}
          {latestDay >= MILESTONES[0].day && latestDay <= MISSION_LENGTH && (
            <div
              className="absolute w-3 h-3 -mt-[6px] -ml-[6px] rounded-full bg-accent ring-4 ring-accent/20 animate-pulse z-10"
              style={{ top: '10px', left: `${(latestDay / MISSION_LENGTH) * 100}%` }}
              title={`Mission Day ${latestDay}`}
            />
          )}

          {/* Milestones */}
          {MILESTONES.map((m) => {
            const reached = latestDay >= m.day;
            const isNext = nextMilestone?.day === m.day;
            return (
              <div
                key={m.day}
                className="absolute -translate-x-1/2 flex flex-col items-center w-28"
                style={{ left: `${(m.day / MISSION_LENGTH) * 100}%`, top: 0 }}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    reached
                      ? 'bg-accent border-accent'
                      : 'bg-space-surface border-space-border'
                  }`}
                  style={reached ? { boxShadow: '0 0 12px var(--color-accent-glow)' } : undefined}
                >
                  {reached && <Check className="w-3 h-3 text-space-bg" />}
                </div>
                <p className={`text-xs font-semibold mt-3 text-center ${reached ? 'text-accent' : 'text-space-muted'}`}>
                  {m.label}
                </p>
                <p className="text-[10px] text-space-muted mt-0.5">Day {m.day}</p>
                {isNext && (
                  <p className="text-[10px] text-accent font-medium mt-1">
                    {m.day - latestDay} days to go
                  </p>
                )}
                <p className="text-[10px] text-space-muted mt-1.5 text-center leading-relaxed">
                  {m.tip}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
