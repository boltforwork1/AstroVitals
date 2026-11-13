import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { IndicatorKey } from '@/types/health';
import { indicators } from '@/data/indicators';
import { indicatorInfo } from '@/data/indicatorInfo';
import { getStatus, statusColor } from '@/utils/status';

interface IndicatorModalProps {
  indicatorKey: IndicatorKey | null;
  currentValue: number | null;
  onClose: () => void;
}

const STATUS_LABEL = {
  normal: 'Normal',
  caution: 'Caution',
  critical: 'Critical',
} as const;

export default function IndicatorModal({ indicatorKey, currentValue, onClose }: IndicatorModalProps) {
  useEffect(() => {
    if (!indicatorKey) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [indicatorKey, onClose]);

  return (
    <AnimatePresence>
      {indicatorKey && currentValue !== null && (
        <ModalContent
          key={indicatorKey}
          indicatorKey={indicatorKey}
          currentValue={currentValue}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}

function ModalContent({
  indicatorKey,
  currentValue,
  onClose,
}: {
  indicatorKey: IndicatorKey;
  currentValue: number;
  onClose: () => void;
}) {
  const ind = indicators[indicatorKey];
  const info = indicatorInfo[indicatorKey];
  const status = getStatus(indicatorKey, currentValue);
  const color = statusColor(status);
  const IconComp = (Icons as unknown as Record<string, LucideIcon>)[ind.icon] || Icons.Activity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-space-surface border border-space-border rounded-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-space-border">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl"
              style={{ backgroundColor: `${color}15` }}
            >
              <IconComp className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-space-text">{ind.label}</h2>
              <p className="text-xs text-space-muted">{ind.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-space-muted hover:text-space-text hover:bg-space-border/50 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current value + status */}
        <div className="flex items-center gap-4 p-6 border-b border-space-border">
          <div className="flex flex-col">
            <span className="text-xs text-space-muted uppercase tracking-wider mb-1">Current</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-space-text tabular-nums">{currentValue}</span>
              <span className="text-sm text-space-muted">{ind.unit}</span>
            </div>
          </div>
          <div
            className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: `${color}15`, color }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
            />
            {STATUS_LABEL[status]}
          </div>
        </div>

        {/* Range bars */}
        <div className="p-6 border-b border-space-border">
          <p className="text-xs text-space-muted uppercase tracking-wider mb-3">Target Ranges</p>
          <div className="space-y-2.5">
            <RangeRow
              label="Normal"
              range={ind.normalRange}
              unit={ind.unit}
              color={statusColor('normal')}
            />
            <RangeRow
              label="Caution"
              range={ind.cautionRange}
              unit={ind.unit}
              color={statusColor('caution')}
            />
          </div>
        </div>

        {/* Info sections */}
        <div className="p-6 space-y-5">
          <InfoSection title="How to measure it" text={info.measure} />
          <InfoSection title="Why it matters in space" text={info.whyItMatters} />
          <InfoSection title="What can push it out of range" text={info.outOfRange} />
        </div>
      </motion.div>
    </div>
  );
}

function RangeRow({
  label,
  range,
  unit,
  color,
}: {
  label: string;
  range: { min: number; max: number };
  unit: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-sm text-space-text w-16">{label}</span>
      <span className="text-sm text-space-muted tabular-nums">
        {range.min} – {range.max} {unit}
      </span>
    </div>
  );
}

function InfoSection({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-space-text mb-1.5">{title}</h3>
      <p className="text-sm text-space-muted leading-relaxed">{text}</p>
    </div>
  );
}
