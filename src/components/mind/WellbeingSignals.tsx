import { motion } from 'framer-motion';
import { CircleCheck, TriangleAlert as AlertTriangle, Info } from 'lucide-react';
import type { WellbeingSignal } from '@/utils/wellbeing';

interface WellbeingSignalsProps {
  signals: WellbeingSignal[];
}

export default function WellbeingSignals({ signals }: WellbeingSignalsProps) {
  if (signals.length === 0) {
    return (
      <div className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6 h-full flex flex-col">
        <h2 className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-4">
          Wellbeing Signals
        </h2>
        <div className="flex flex-col items-center justify-center flex-1 text-center py-6">
          <div className="w-12 h-12 rounded-full bg-status-normal/10 border border-status-normal/30 flex items-center justify-center mb-3">
            <CircleCheck className="w-6 h-6 text-status-normal" />
          </div>
          <p className="text-sm font-medium text-status-normal">All clear</p>
          <p className="text-xs text-space-muted mt-1">No wellbeing concerns detected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6 h-full">
      <h2 className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-4">
        Wellbeing Signals
      </h2>
      <div className="space-y-3">
        {signals.map((sig, i) => {
          const color = sig.level === 'caution' ? '#F59E0B' : '#22D3EE';
          const Icon = sig.level === 'caution' ? AlertTriangle : Info;
          return (
            <motion.div
              key={sig.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-space-bg/40 border border-space-border"
            >
              <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-space-text">{sig.label}</p>
                <p className="text-xs text-space-muted mt-0.5 leading-relaxed">{sig.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
