import { useState } from 'react';
import { motion } from 'framer-motion';
import { CAREER_LIMIT_MSV, RADIATION_ENVIRONMENTS, type EnvironmentId } from '@/data/radiationConfig';
import { projectTotal, roundDose } from '@/utils/radiation';

interface EnvironmentCompareProps {
  cumulative: number;
  remainingDays: number;
}

export default function EnvironmentCompare({ cumulative, remainingDays }: EnvironmentCompareProps) {
  const [selectedId, setSelectedId] = useState<EnvironmentId>('leo');
  const env = RADIATION_ENVIRONMENTS.find((e) => e.id === selectedId) ?? RADIATION_ENVIRONMENTS[0];
  const added = roundDose(env.doseRateMsvPerDay * remainingDays);
  const total = projectTotal(cumulative, env.doseRateMsvPerDay, remainingDays);
  const percent = (total / CAREER_LIMIT_MSV) * 100;

  return (
    <section aria-labelledby="environment-title" className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6">
      <h2 id="environment-title" className="text-sm font-semibold text-space-muted uppercase tracking-wider">
        Environment comparison
      </h2>
      <p className="text-xs text-space-muted mt-1">
        See how the remaining mission would add to your dose in each setting.
      </p>

      <div role="group" aria-label="Choose an environment" className="flex flex-wrap gap-2 mt-4">
        {RADIATION_ENVIRONMENTS.map((e) => {
          const selected = e.id === env.id;
          return (
            <button
              key={e.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedId(e.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                selected
                  ? 'bg-accent/15 text-accent border-accent/40'
                  : 'text-space-muted border-space-border hover:text-space-text hover:border-space-muted'
              }`}
            >
              {e.label}
            </button>
          );
        })}
      </div>

      <motion.div
        key={env.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5"
      >
        <div className="rounded-lg bg-space-bg/40 border border-space-border p-4">
          <p className="text-[10px] text-space-muted uppercase tracking-wider">Typical dose rate</p>
          <p className="text-lg font-semibold text-space-text tabular-nums mt-1">
            {env.doseRateMsvPerDay} <span className="text-xs text-space-muted font-normal">mSv/day</span>
          </p>
        </div>
        <div className="rounded-lg bg-space-bg/40 border border-space-border p-4">
          <p className="text-[10px] text-space-muted uppercase tracking-wider">
            {remainingDays} remaining days add
          </p>
          <p className="text-lg font-semibold text-space-text tabular-nums mt-1">
            {added.toFixed(1)} <span className="text-xs text-space-muted font-normal">mSv</span>
          </p>
        </div>
        <div className="rounded-lg bg-space-bg/40 border border-space-border p-4">
          <p className="text-[10px] text-space-muted uppercase tracking-wider">Projected total</p>
          <p className="text-lg font-semibold text-space-text tabular-nums mt-1">
            {total.toFixed(1)} <span className="text-xs text-space-muted font-normal">mSv</span>
            <span className="block sm:inline text-xs text-space-muted font-normal sm:ml-2">
              ({percent.toFixed(1)}% of limit)
            </span>
          </p>
        </div>
      </motion.div>

      <p className="text-sm text-space-muted leading-relaxed mt-4">{env.description}</p>
      <p className="text-[11px] text-space-muted mt-3">Environment profiles are illustrative.</p>
    </section>
  );
}
