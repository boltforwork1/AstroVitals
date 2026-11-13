import { motion } from 'framer-motion';
import { CircleCheck } from 'lucide-react';
import { useStorm, type ActiveStorm } from '@/context/StormContext';
import { useRecords } from '@/context/RecordsContext';
import { SHELTER_DOSE_REDUCTION } from '@/data/radiationConfig';
import { roundDose, stormDose, stormUnprotectedDose, sumDose } from '@/utils/radiation';

interface StormRecoveryPhaseProps {
  storm: ActiveStorm;
}

export default function StormRecoveryPhase({ storm }: StormRecoveryPhaseProps) {
  const { endStorm } = useStorm();
  const { records } = useRecords();

  const unprotected = stormUnprotectedDose(storm.level);
  const applied = stormDose(storm.level, storm.sheltered);
  const saved = roundDose(unprotected - applied);
  const newTotal = roundDose(sumDose(records) + applied);

  const outcome = storm.sheltered
    ? `Sheltering saved ${saved.toFixed(2)} mSv compared with staying exposed (${unprotected} mSv unprotected).`
    : `Without shelter the storm would have added ${unprotected} mSv. Completing the checklist saves about ${roundDose(unprotected * SHELTER_DOSE_REDUCTION).toFixed(2)} mSv.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-status-normal/10 border border-status-normal/30 shrink-0">
          <CircleCheck className="w-6 h-6 text-status-normal" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-space-text">All clear</h3>
          <p className="text-sm text-space-muted mt-0.5">The solar particle event has passed. Review your dose below.</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SummaryItem label="Extra dose received" value={`${applied.toFixed(2)} mSv`} />
        <SummaryItem label="Shelter completed" value={storm.sheltered ? 'Yes' : 'No'} />
        <SummaryItem label="New cumulative total" value={`${newTotal.toFixed(2)} mSv`} />
        <SummaryItem label="Unprotected estimate" value={`${unprotected.toFixed(2)} mSv`} />
      </dl>

      <p className="text-sm text-space-text leading-relaxed">{outcome}</p>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={endStorm}
          className="px-4 py-2.5 rounded-xl bg-accent text-space-bg text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_var(--color-accent-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-space-bg/40 border border-space-border px-4 py-3">
      <dt className="text-[10px] text-space-muted uppercase tracking-wider">{label}</dt>
      <dd className="text-base font-semibold text-space-text tabular-nums mt-1">{value}</dd>
    </div>
  );
}
