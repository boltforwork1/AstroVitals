import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Radio } from 'lucide-react';
import type { DailyRecord } from '@/types/health';
import type { WellbeingSignal } from '@/utils/wellbeing';
import { getTrend } from '@/utils/trend';
import { useWellbeing } from '@/context/WellbeingContext';

interface GroundSupportModalProps {
  records: DailyRecord[];
  signals: WellbeingSignal[];
  onClose: () => void;
}

type CopyState = 'idle' | 'copied' | 'failed';

export default function GroundSupportModal({ records, signals, onClose }: GroundSupportModalProps) {
  const { pulseResults, journalEntries } = useWellbeing();
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const latest = records[records.length - 1];
  const latestPulse = pulseResults[pulseResults.length - 1];
  const moodTrend = getTrend(records, 'mood');

  const report = useMemo(() => {
    const lines: string[] = [];
    lines.push('ASTROVITALS - GROUND SUPPORT NOTE', '');
    lines.push(`Crew member: Cdr. Alex Rivera (Commander)`);
    lines.push(`Mission day: ${latest.missionDay}`);
    lines.push(`Date: ${latest.date}`);
    lines.push(`Mood: ${latest.mood.toFixed(1)}/5`);

    const dirText = moodTrend.direction === 'flat' ? 'stable' : `${moodTrend.direction} ${moodTrend.percent}%`;
    lines.push(`Mood trend: ${dirText}`);

    if (latestPulse) {
      lines.push(`Latest wellbeing pulse: ${latestPulse.score}/100 (Day ${latestPulse.missionDay})`);
    } else {
      lines.push('Latest wellbeing pulse: none recorded');
    }

    lines.push(`Recent journal entries: ${journalEntries.length}`);
    if (signals.length > 0) {
      lines.push('', 'Active wellbeing signals:');
      signals.forEach((s) => lines.push(`- ${s.label}: ${s.detail}`));
    } else {
      lines.push('', 'Active wellbeing signals: none');
    }

    lines.push('', 'Decision-support only. Not a medical diagnosis.');
    return lines.join('\n');
  }, [latest, moodTrend, latestPulse, journalEntries.length, signals]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="ground-support-title">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-space-surface border border-space-border rounded-xl shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4 p-5 border-b border-space-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-status-critical/10 border border-status-critical/20 shrink-0">
                <Radio className="w-5 h-5 text-status-critical" />
              </div>
              <div>
                <h2 id="ground-support-title" className="text-base font-semibold text-space-text">
                  Note for Ground Support
                </h2>
                <p className="text-xs text-space-muted mt-0.5">Auto-filled summary for handover</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg text-space-muted hover:text-space-text hover:bg-space-bg/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <pre className="flex-1 overflow-auto m-5 p-4 rounded-lg bg-space-bg/60 border border-space-border text-xs leading-relaxed text-space-text font-mono whitespace-pre">
            {report}
          </pre>

          <div className="flex justify-end gap-2 px-5 pb-5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-space-bg bg-accent hover:bg-accent/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {copyState === 'copied' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : 'Copy to clipboard'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
