import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Download, X } from 'lucide-react';
import type { Alert } from '@/types/alerts';
import { useRecords } from '@/context/RecordsContext';
import { buildSurgeonReport } from '@/utils/surgeonReport';

interface SurgeonReportModalProps {
  alerts: Alert[];
  onClose: () => void;
}

type CopyState = 'idle' | 'copied' | 'failed';

export default function SurgeonReportModal({ alerts, onClose }: SurgeonReportModalProps) {
  const { records } = useRecords();
  const report = useMemo(() => buildSurgeonReport(records, alerts), [records, alerts]);
  const latestDay = records[records.length - 1].missionDay;
  const [copyState, setCopyState] = useState<CopyState>('idle');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astrovitals_surgeon_report_day${latestDay}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="surgeon-report-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-space-surface border border-space-border rounded-xl shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-space-border">
          <div>
            <h2 id="surgeon-report-title" className="text-base font-semibold text-space-text">
              Flight surgeon report
            </h2>
            <p className="text-xs text-space-muted mt-0.5">Mission day {latestDay}, structured for handover</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report"
            className="p-1.5 rounded-lg text-space-muted hover:text-space-text hover:bg-space-bg/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <pre className="flex-1 overflow-auto m-5 p-4 rounded-lg bg-space-bg/60 border border-space-border text-xs leading-relaxed text-space-text font-mono whitespace-pre">
          {report}
        </pre>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 pb-5">
          <p className="text-[11px] text-space-muted leading-relaxed">
            In a real mission this would be sent over the communication link with the expected delay.
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-space-bg bg-accent hover:bg-accent/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {copyState === 'copied' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : 'Copy to clipboard'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-space-text border border-space-border hover:border-space-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Download className="w-3.5 h-3.5" />
              Download .txt
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
