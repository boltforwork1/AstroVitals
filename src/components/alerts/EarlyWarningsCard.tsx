import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAlerts } from '@/context/AlertsContext';
import { alertLevelColor } from '@/utils/alerts';

const MAX_WARNINGS = 2;

export default function EarlyWarningsCard() {
  const { alerts } = useAlerts();
  const warnings = alerts
    .filter((a) => a.kind === 'prediction' || a.kind === 'combined')
    .slice(0, MAX_WARNINGS);

  if (warnings.length === 0) return null;

  return (
    <section
      aria-labelledby="early-warnings-title"
      className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 id="early-warnings-title" className="text-sm font-semibold text-space-muted uppercase tracking-wider">
          Early Warnings
        </h2>
        <Link
          to="/alerts"
          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          View all alerts
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {warnings.map((w) => (
          <div
            key={w.id}
            className="rounded-lg bg-space-bg/40 border border-space-border border-l-4 p-4"
            style={{ borderLeftColor: alertLevelColor(w.level) }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-space-text">{w.title}</p>
              {w.daysToCross !== undefined && (
                <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent tabular-nums">
                  in about {w.daysToCross} {w.daysToCross === 1 ? 'day' : 'days'}
                </span>
              )}
            </div>
            <p className="text-xs text-space-muted mt-1 line-clamp-1">{w.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
