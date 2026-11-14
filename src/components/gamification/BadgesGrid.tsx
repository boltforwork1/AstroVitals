import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Lock, Trophy, X } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { TIER_COLOR } from '@/data/gamificationConfig';
import type { BadgeStatus } from '@/utils/gamification';

type Filter = 'all' | 'unlocked' | 'locked';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unlocked', label: 'Unlocked' },
  { value: 'locked', label: 'Locked' },
];

function badgeIcon(name: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[name] || Icons.Trophy;
}

export default function BadgesGrid() {
  const { badges } = useGamification();
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<BadgeStatus | null>(null);

  const visible = badges.filter((b) => {
    if (filter === 'unlocked') return b.status === 'unlocked';
    if (filter === 'locked') return b.status === 'locked';
    return true;
  });

  return (
    <section aria-labelledby="badges-title" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 id="badges-title" className="text-sm font-semibold text-space-muted uppercase tracking-wider">
            Badges
          </h2>
          <p className="text-xs text-space-muted mt-1">
            {badges.filter((b) => b.status === 'unlocked').length} of {badges.length} unlocked
          </p>
        </div>
        <div role="group" aria-label="Filter badges" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                filter === f.value
                  ? 'bg-accent/15 text-accent border-accent/40'
                  : 'text-space-muted border-space-border hover:text-space-text hover:border-space-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {visible.map((badge, i) => {
          const IconComp = badgeIcon(badge.def.icon);
          const tierColor = TIER_COLOR[badge.def.tier];
          const unlocked = badge.status === 'unlocked';
          const progressPct = Math.min(100, (badge.progress.current / badge.progress.target) * 100);

          return (
            <motion.button
              key={badge.def.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: 'easeOut' }}
              whileHover={{ y: -2 }}
              onClick={() => setSelected(badge)}
              className="relative flex flex-col items-center text-center p-4 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              style={{
                backgroundColor: unlocked ? `${tierColor}08` : 'rgba(15, 22, 38, 0.5)',
                borderColor: unlocked ? `${tierColor}40` : 'var(--color-border)',
                boxShadow: unlocked ? `0 0 16px ${tierColor}15` : 'none',
              }}
              aria-label={`${badge.def.name}: ${unlocked ? 'unlocked' : 'locked'}`}
            >
              <span
                className="flex items-center justify-center w-12 h-12 rounded-xl mb-3 shrink-0"
                style={{
                  backgroundColor: unlocked ? `${tierColor}15` : 'rgba(28, 39, 64, 0.5)',
                  opacity: unlocked ? 1 : 0.4,
                }}
              >
                {unlocked ? (
                  <IconComp className="w-6 h-6" style={{ color: tierColor }} />
                ) : (
                  <Lock className="w-5 h-5 text-space-muted" />
                )}
              </span>

              <p
                className="text-sm font-semibold leading-tight"
                style={{ color: unlocked ? 'var(--color-text)' : 'var(--color-muted)', opacity: unlocked ? 1 : 0.6 }}
              >
                {badge.def.name}
              </p>
              <p className="text-[11px] text-space-muted mt-1 leading-relaxed line-clamp-2">
                {badge.def.description}
              </p>

              {unlocked ? (
                <span
                  className="mt-3 text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${tierColor}15`, color: tierColor }}
                >
                  {badge.def.tier} · +{badge.def.xpBonus} XP
                </span>
              ) : (
                <div className="w-full mt-3">
                  <div className="h-1.5 rounded-full bg-space-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-space-muted"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-space-muted mt-1 tabular-nums">
                    {badge.progress.current}/{badge.progress.target}
                  </p>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && <BadgeModal badge={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}

function BadgeModal({ badge, onClose }: { badge: BadgeStatus; onClose: () => void }) {
  const IconComp = badgeIcon(badge.def.icon);
  const tierColor = TIER_COLOR[badge.def.tier];
  const unlocked = badge.status === 'unlocked';
  const progressPct = Math.min(100, (badge.progress.current / badge.progress.target) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={badge.def.name}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-space-surface border border-space-border rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-start justify-between p-5 border-b border-space-border">
          <div className="flex items-center gap-4">
            <span
              className="flex items-center justify-center w-14 h-14 rounded-2xl shrink-0"
              style={{
                backgroundColor: unlocked ? `${tierColor}15` : 'rgba(28, 39, 64, 0.5)',
                boxShadow: unlocked ? `0 0 20px ${tierColor}30` : 'none',
              }}
            >
              {unlocked ? (
                <IconComp className="w-7 h-7" style={{ color: tierColor }} />
              ) : (
                <Lock className="w-6 h-6 text-space-muted" />
              )}
            </span>
            <div>
              <h3 className="text-base font-semibold text-space-text">{badge.def.name}</h3>
              <span
                className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full capitalize"
                style={{ backgroundColor: `${tierColor}15`, color: tierColor }}
              >
                {badge.def.tier} · +{badge.def.xpBonus} XP
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-space-muted hover:text-space-text hover:bg-space-border/50 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-space-muted leading-relaxed">{badge.def.description}</p>

          <div>
            <p className="text-xs font-semibold text-space-muted uppercase tracking-wider mb-2">Progress</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-space-border overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${progressPct}%`, backgroundColor: unlocked ? tierColor : 'var(--color-muted)' }}
                />
              </div>
              <span className="text-xs font-medium text-space-text tabular-nums shrink-0">
                {badge.progress.current}/{badge.progress.target}
              </span>
            </div>
          </div>

          {unlocked && badge.unlockedMissionDay !== undefined && (
            <div className="flex items-center gap-2 text-sm text-status-normal">
              <Trophy className="w-4 h-4" />
              <span>Unlocked on Mission Day {badge.unlockedMissionDay}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
