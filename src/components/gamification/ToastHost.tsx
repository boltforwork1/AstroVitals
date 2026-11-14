import { AnimatePresence, motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import type { GamificationToast } from '@/context/GamificationContext';

const PARTICLES = [0, 45, 90, 135, 180, 225, 270, 315];

function ParticleBurst({ color }: { color: string }) {
  return (
    <span className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      {PARTICLES.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.span
            key={angle}
            className="absolute left-1/2 top-1/2 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full"
            style={{ backgroundColor: color }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
            animate={{
              x: Math.cos(rad) * 34,
              y: Math.sin(rad) * 34,
              opacity: [0, 1, 0],
              scale: [0.6, 1, 0.4],
            }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        );
      })}
    </span>
  );
}

function ToastBody({ toast }: { toast: GamificationToast }) {
  if (toast.kind === 'badge') {
    return (
      <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-space-surface border shadow-2xl"
        style={{ borderColor: `${toast.tierColor ?? '#F5C542'}55` }}
      >
        <span
          className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
          style={{ backgroundColor: `${toast.tierColor ?? '#F5C542'}20` }}
        >
          <Trophy className="w-4.5 h-4.5 w-[18px] h-[18px]" style={{ color: toast.tierColor ?? '#F5C542' }} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-space-text truncate">{toast.title}</p>
          {toast.detail && <p className="text-xs" style={{ color: toast.tierColor ?? '#F5C542' }}>{toast.detail}</p>}
        </div>
      </div>
    );
  }

  if (toast.kind === 'level') {
    return (
      <div className="relative flex items-center gap-3 px-5 py-4 rounded-xl bg-space-surface border border-accent/50 shadow-2xl">
        <ParticleBurst color="#22D3EE" />
        <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/15 shrink-0">
          <Trophy className="w-5 h-5 text-accent" />
        </span>
        <p className="text-base font-semibold text-space-text">{toast.title}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 rounded-full bg-space-surface border border-space-border shadow-xl">
      <p className="text-sm font-semibold text-accent tabular-nums">{toast.title}</p>
    </div>
  );
}

export default function ToastHost() {
  const { toasts, dismissToast } = useGamification();
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      aria-live="polite"
      className="fixed z-[60] bottom-20 lg:bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 sm:left-auto flex flex-col items-center sm:items-end gap-2 pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={() => dismissToast(toast.id)}
            className="pointer-events-auto text-left max-w-[calc(100vw-2rem)]"
          >
            <ToastBody toast={reduceMotion ? { ...toast } : toast} />
            {toast.kind === 'level' && reduceMotion && null}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
