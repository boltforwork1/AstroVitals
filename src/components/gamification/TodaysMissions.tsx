import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ClipboardCheck, Dumbbell, Check, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';

const MISSION_ICON: Record<string, LucideIcon> = {
  checkin: ClipboardCheck,
  exercise80: Dumbbell,
  mind: Brain,
};

const MISSION_ROUTE: Record<string, string> = {
  checkin: '/check-in',
  exercise80: '/training',
  mind: '/mind',
};

const MISSION_BUTTON: Record<string, string> = {
  checkin: 'Go to Check-in',
  exercise80: 'Open Training',
  mind: 'Open Mind',
};

export default function TodaysMissions() {
  const { todayMissions, weeklyChallenges } = useGamification();
  const navigate = useNavigate();

  return (
    <section aria-labelledby="missions-title" className="space-y-5">
      <div>
        <h2 id="missions-title" className="text-sm font-semibold text-space-muted uppercase tracking-wider">
          Today&apos;s Missions
        </h2>
        <p className="text-xs text-space-muted mt-1">Small tasks that build healthy habits</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {todayMissions.map((mission, i) => {
          const Icon = MISSION_ICON[mission.id] ?? ClipboardCheck;
          const route = MISSION_ROUTE[mission.id] ?? '/dashboard';
          const buttonLabel = MISSION_BUTTON[mission.id] ?? 'Go';
          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
              className="bg-space-surface border border-space-border rounded-xl p-5 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 shrink-0">
                    <Icon className="w-5 h-5 text-accent" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-space-text">{mission.label}</p>
                    <p className="text-xs text-accent font-medium mt-0.5">+{mission.xp} XP</p>
                  </div>
                </div>
                {mission.done && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="flex items-center justify-center w-7 h-7 rounded-full bg-status-normal/15 border border-status-normal/30 shrink-0"
                  >
                    <Check className="w-4 h-4 text-status-normal" />
                  </motion.span>
                )}
              </div>

              <div>
                <div className="h-1.5 rounded-full bg-space-border overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(mission.progress * 100)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[11px] text-space-muted mt-1.5 tabular-nums">
                  {Math.round(mission.progress * 100)}% complete
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(route)}
                className="mt-auto flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {buttonLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly challenges */}
      <div className="bg-space-surface border border-space-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-4">
          Weekly Challenges
        </h3>
        <div className="space-y-4">
          {weeklyChallenges.map((challenge) => (
            <div key={challenge.id}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-sm text-space-text">{challenge.label}</span>
                <span className="text-xs text-space-muted tabular-nums shrink-0">
                  {Math.min(challenge.current, challenge.target)}/{challenge.target}
                  {challenge.done && <span className="text-status-normal ml-1.5">Done</span>}
                </span>
              </div>
              <div className="h-2 rounded-full bg-space-border overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${challenge.done ? 'bg-status-normal' : 'bg-accent'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (challenge.current / challenge.target) * 100)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
