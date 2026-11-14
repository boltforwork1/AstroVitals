import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Zap } from 'lucide-react';
import { XP_RULES } from '@/data/gamificationConfig';

const XP_EXPLANATIONS: { label: string; value: number }[] = [
  { label: 'Each daily check-in', value: XP_RULES.checkIn },
  { label: 'Reaching 80% of the exercise target', value: XP_RULES.exerciseReached80 },
  { label: 'Reaching 100% of the exercise target', value: XP_RULES.exerciseReached100 },
  { label: 'Each mind session (breathing, grounding, connection)', value: XP_RULES.mindSession },
  { label: 'Each weekly wellbeing pulse check', value: XP_RULES.weeklyPulse },
  { label: 'Each journal entry (one per day counts)', value: XP_RULES.journalEntry },
  { label: 'Sheltering during a solar storm', value: XP_RULES.stormSheltered },
];

export default function HowXpWorks() {
  const [open, setOpen] = useState(false);

  return (
    <section className="bg-space-surface border border-space-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-space-bg/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-space-text">
          <Zap className="w-4 h-4 text-accent shrink-0" />
          How XP Works
        </span>
        <ChevronDown
          className={`w-4 h-4 text-space-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <ul className="px-5 pb-5 space-y-2.5">
              {XP_EXPLANATIONS.map((rule) => (
                <li key={rule.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-space-muted">{rule.label}</span>
                  <span className="text-accent font-semibold tabular-nums shrink-0">+{rule.value} XP</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 text-sm pt-2.5 border-t border-space-border">
                <span className="text-space-muted">Badge bonuses</span>
                <span className="text-accent font-semibold shrink-0">+50 to +200 XP</span>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
