import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Bell } from 'lucide-react';
import { useAlerts } from '@/context/AlertsContext';
import { alertLevelColor } from '@/utils/alerts';

const PREVIEW_COUNT = 5;

export default function AlertsBell() {
  const { alerts, unreadCount, unreadCriticalCount } = useAlerts();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const preview = alerts.slice(0, PREVIEW_COUNT);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const badgeClass =
    unreadCriticalCount > 0 ? 'bg-status-critical text-white' : 'bg-status-caution text-space-bg';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Alerts, ${unreadCount} unread`}
        className="relative flex items-center justify-center w-9 h-9 rounded-full border border-space-border bg-space-surface text-space-muted hover:text-space-text hover:border-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-[18px] text-center tabular-nums ${badgeClass}`}
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="region"
            aria-label="Alerts"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] z-50 rounded-xl border border-space-border bg-space-surface shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-space-border">
              <p className="text-sm font-semibold text-space-text">Alerts</p>
              <p className="text-xs text-space-muted tabular-nums">{unreadCount} unread</p>
            </div>

            {preview.length === 0 ? (
              <p className="px-4 py-6 text-sm text-space-muted text-center">
                No active alerts. Keep up your routine.
              </p>
            ) : (
              <ul className="max-h-80 overflow-y-auto divide-y divide-space-border">
                {preview.map((a) => (
                  <li key={a.id} className="flex gap-3 px-4 py-3">
                    <span
                      className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: alertLevelColor(a.level) }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-space-text truncate">{a.title}</p>
                      <p className="text-xs text-space-muted line-clamp-2 mt-0.5">{a.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <Link
              to="/alerts"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-3 border-t border-space-border text-sm font-medium text-accent hover:bg-space-bg/50 transition-colors"
            >
              View all alerts
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
