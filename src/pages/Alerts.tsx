import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheck } from 'lucide-react';
import { useAlerts } from '@/context/AlertsContext';
import AlertCard from '@/components/alerts/AlertCard';
import SurgeonReportModal from '@/components/alerts/SurgeonReportModal';
import AlertsDemoTools from '@/components/alerts/AlertsDemoTools';
import type { AlertKind, AlertLevel } from '@/types/alerts';
import { ALERT_LEVEL_LABEL, alertLevelColor } from '@/utils/alerts';

type LevelFilter = AlertLevel | 'all';
type KindGroup = 'all' | 'prediction' | 'trend' | 'combined' | 'threshold';

const LEVEL_FILTERS: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'caution', label: 'Caution' },
  { value: 'info', label: 'Info' },
];

const KIND_FILTERS: { value: KindGroup; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'prediction', label: 'Prediction' },
  { value: 'trend', label: 'Trend' },
  { value: 'combined', label: 'Combined' },
  { value: 'threshold', label: 'Threshold/Streak' },
];

const SUMMARY_LEVELS: AlertLevel[] = ['critical', 'caution', 'info'];

function kindGroup(kind: AlertKind): Exclude<KindGroup, 'all'> {
  return kind === 'streak' ? 'threshold' : kind;
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        active
          ? 'bg-accent/15 text-accent border-accent/40'
          : 'text-space-muted border-space-border hover:text-space-text hover:border-space-muted'
      }`}
    >
      {children}
    </button>
  );
}

export default function Alerts() {
  const { alerts, counts, unreadCount, acknowledge, acknowledgeAll, snooze } = useAlerts();
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [kindFilter, setKindFilter] = useState<KindGroup>('all');
  const [reportOpen, setReportOpen] = useState(false);

  const filtered = useMemo(
    () =>
      alerts.filter(
        (a) =>
          (levelFilter === 'all' || a.level === levelFilter) &&
          (kindFilter === 'all' || kindGroup(a.kind) === kindFilter)
      ),
    [alerts, levelFilter, kindFilter]
  );

  const reportAlerts = useMemo(() => alerts.filter((a) => a.level !== 'info'), [alerts]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-space-text">Alerts</h1>
          <p className="text-sm text-space-muted mt-0.5">Rule-based signals from your recent check-ins</p>
        </div>
        <button
          type="button"
          onClick={acknowledgeAll}
          disabled={unreadCount === 0}
          className="self-start sm:self-auto px-3 py-2 rounded-lg text-xs font-semibold text-space-text border border-space-border hover:border-accent/40 transition-colors disabled:text-space-muted disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Mark all as read
        </button>
      </header>

      <div className="flex flex-wrap gap-2" role="list" aria-label="Alert counts">
        {SUMMARY_LEVELS.map((level) => {
          const color = alertLevelColor(level);
          return (
            <span
              key={level}
              role="listitem"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
              style={{ color, backgroundColor: `${color}15`, borderColor: `${color}40` }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
              {ALERT_LEVEL_LABEL[level]}
              <span className="font-bold tabular-nums">{counts[level]}</span>
            </span>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by level">
          {LEVEL_FILTERS.map((f) => (
            <FilterChip key={f.value} active={levelFilter === f.value} onClick={() => setLevelFilter(f.value)}>
              {f.label}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by kind">
          {KIND_FILTERS.map((f) => (
            <FilterChip key={f.value} active={kindFilter === f.value} onClick={() => setKindFilter(f.value)}>
              {f.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {alerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center py-16 bg-space-surface border border-space-border rounded-xl"
        >
          <div className="w-14 h-14 rounded-full bg-status-normal/10 border border-status-normal/30 flex items-center justify-center mb-3">
            <CircleCheck className="w-7 h-7 text-status-normal" />
          </div>
          <p className="text-sm font-medium text-status-normal">No active alerts. Keep up your routine.</p>
        </motion.div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-space-muted text-center py-10">No alerts match these filters.</p>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {filtered.map((a) => (
              <AlertCard
                key={a.id}
                alert={a}
                onAcknowledge={acknowledge}
                onSnooze={snooze}
                onPrepareReport={() => setReportOpen(true)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <footer className="space-y-4 pt-4">
        <p className="text-xs text-space-muted text-center leading-relaxed">
          Decision-support only. Not a medical diagnosis. Follow mission medical protocols.
        </p>
        <AlertsDemoTools />
      </footer>

      {reportOpen && <SurgeonReportModal alerts={reportAlerts} onClose={() => setReportOpen(false)} />}
    </div>
  );
}
