import { motion } from 'framer-motion';
import { Check, Clock, Stethoscope } from 'lucide-react';
import type { AlertState } from '@/types/alerts';
import { indicators } from '@/data/indicators';
import { ALERT_KIND_LABEL, ALERT_LEVEL_LABEL, alertLevelColor } from '@/utils/alerts';
import PredictionChart from './PredictionChart';

interface AlertCardProps {
  alert: AlertState;
  onAcknowledge: (id: string) => void;
  onSnooze: (id: string) => void;
  onPrepareReport: () => void;
}

export default function AlertCard({ alert, onAcknowledge, onSnooze, onPrepareReport }: AlertCardProps) {
  const color = alertLevelColor(alert.level);
  const titleId = `alert-${alert.id}-title`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25 }}
      aria-labelledby={titleId}
      className="bg-space-surface border border-space-border border-l-4 rounded-xl p-5"
      style={{ borderLeftColor: color }}
    >
      <header className="flex flex-wrap items-center gap-2 mb-1.5">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider"
          style={{ color }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
            aria-hidden="true"
          />
          {ALERT_LEVEL_LABEL[alert.level]}
        </span>
        <span className="text-[11px] text-space-muted">{ALERT_KIND_LABEL[alert.kind]}</span>
        {!alert.acknowledged && (
          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent">
            New
          </span>
        )}
      </header>

      <h3 id={titleId} className="text-base font-semibold text-space-text">
        {alert.title}
      </h3>
      <p className="text-sm text-space-muted leading-relaxed mt-1">{alert.message}</p>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {alert.indicatorKeys.map((key) => (
          <span
            key={key}
            className="text-[11px] px-2 py-0.5 rounded-md bg-space-bg/60 border border-space-border text-space-text"
          >
            {indicators[key].label}
          </span>
        ))}
      </div>

      {alert.kind === 'prediction' && alert.indicatorKeys[0] && (
        <div className="mt-4">
          <PredictionChart indicatorKey={alert.indicatorKeys[0]} />
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs font-semibold text-space-muted uppercase tracking-wider mb-2">
          What you can do
        </p>
        <ul className="space-y-1.5">
          {alert.actions.map((action) => (
            <li key={action} className="flex items-start gap-2 text-sm text-space-text">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-status-normal" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {alert.escalate && (
        <div className="mt-4 rounded-lg border border-status-critical/40 bg-status-critical/10 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <Stethoscope className="w-4 h-4 mt-0.5 shrink-0 text-status-critical" />
            <div>
              <p className="text-sm font-semibold text-status-critical">Contact flight surgeon</p>
              <p className="text-xs text-space-text/80">
                Share the current picture with the flight surgeon before the next scheduled check.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onPrepareReport}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-status-critical text-white hover:bg-status-critical/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-critical"
          >
            Prepare report
          </button>
        </div>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => onSnooze(alert.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-space-muted border border-space-border hover:text-space-text hover:border-space-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Clock className="w-3.5 h-3.5" />
          Snooze 1 day
        </button>
        <button
          type="button"
          onClick={() => onAcknowledge(alert.id)}
          disabled={alert.acknowledged}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-space-bg bg-accent hover:bg-accent/85 transition-colors disabled:bg-transparent disabled:text-space-muted disabled:border disabled:border-space-border disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {alert.acknowledged ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Acknowledged
            </>
          ) : (
            'Acknowledge'
          )}
        </button>
      </div>
    </motion.article>
  );
}
