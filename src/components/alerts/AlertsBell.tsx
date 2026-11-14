import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Bell } from 'lucide-react';
import { useAlerts } from '@/context/AlertsContext';
import { alertLevelColor } from '@/utils/alerts';

const PREVIEW_COUNT = 5;
const NARROW_BREAKPOINT = 640;

interface PanelPosition {
  top: number;
  right: number;
  narrow: boolean;
}

export default function AlertsBell() {
  const { alerts, unreadCount, unreadCriticalCount } = useAlerts();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PanelPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const preview = alerts.slice(0, PREVIEW_COUNT);

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
      narrow: window.innerWidth < NARROW_BREAKPOINT,
    });
  }, []);

  const toggle = () => {
    if (!open) updatePosition();
    setOpen((o) => !o);
  };

  const closeAndFocusBell = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAndFocusBell();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, closeAndFocusBell, updatePosition]);

  const badgeClass =
    unreadCriticalCount > 0 ? 'bg-status-critical text-white' : 'bg-status-caution text-space-bg';

  const panelStyle: CSSProperties | null = position
    ? {
        position: 'fixed',
        top: position.top,
        left: position.narrow ? 12 : undefined,
        right: position.narrow ? 12 : position.right,
        width: position.narrow ? undefined : 'min(380px, calc(100vw - 24px))',
        zIndex: 9999,
        background: '#0F1626',
        border: '1px solid #1C2740',
        borderRadius: 16,
        boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        maxHeight: 'calc(100vh - 96px)',
        overflowY: 'auto',
      }
    : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
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

      {createPortal(
        <AnimatePresence>
          {open && panelStyle && (
            <motion.div
              ref={panelRef}
              role="region"
              aria-label="Alerts"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={panelStyle}
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
                onClick={closeAndFocusBell}
                className="flex items-center justify-between px-4 py-3 border-t border-space-border text-sm font-medium text-accent hover:bg-space-bg/50 transition-colors"
              >
                View all alerts
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
