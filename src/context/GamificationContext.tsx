import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useRecords } from './RecordsContext';
import { useWellbeing } from './WellbeingContext';
import { useStorm } from './StormContext';
import { computeGamification, logXpSanity, type GamificationResult } from '@/utils/gamification';

const STORAGE_KEY = 'astrovitals_gamification';

export interface GamificationToast {
  id: string;
  kind: 'badge' | 'level' | 'xp';
  title: string;
  detail?: string;
  tierColor?: string;
}

interface StoredState {
  seenBadges: string[];
  lastLevelId: string | null;
}

interface GamificationContextValue extends GamificationResult {
  toasts: GamificationToast[];
  dismissToast: (id: string) => void;
  resetGamificationState: () => void;
}

const GamificationContext = createContext<GamificationContextValue | null>(null);

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredState> | null;
      if (parsed && typeof parsed === 'object') {
        return {
          seenBadges: Array.isArray(parsed.seenBadges) ? parsed.seenBadges : [],
          lastLevelId: typeof parsed.lastLevelId === 'string' ? parsed.lastLevelId : null,
        };
      }
    }
  } catch {
    // Unreadable storage falls back to a clean state.
  }
  return { seenBadges: [], lastLevelId: null };
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { records, resetToDemo } = useRecords();
  const { sessions, journalEntries, pulseResults } = useWellbeing();
  const { history } = useStorm();

  const [toasts, setToasts] = useState<GamificationToast[]>([]);
  const [stored, setStored] = useState<StoredState>(loadState);
  const isBaselineRun = useRef(stored.lastLevelId === null && stored.seenBadges.length === 0);
  const pendingXpToast = useRef<{ amount: number; timer: number | null }>({ amount: 0, timer: null });
  const prevXp = useRef<number | null>(null);

  const result = useMemo(
    () =>
      computeGamification(records, { sessions, journalEntries, pulseResults }, { history }),
    [records, sessions, journalEntries, pulseResults, history]
  );

  useEffect(() => {
    logXpSanity(result);
  }, [result]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // Storage may be unavailable; state still works for this session.
    }
  }, [stored]);

  const pushToast = useCallback((toast: Omit<GamificationToast, 'id'>) => {
    setToasts((prev) => [...prev.slice(-2), { ...toast, id: uid() }]);
  }, []);

  useEffect(() => {
    const unlockedIds = result.badges
      .filter((b) => b.status === 'unlocked')
      .map((b) => b.def.id);

    // On the very first run, record the baseline silently.
    if (isBaselineRun.current) {
      isBaselineRun.current = false;
      setStored({ seenBadges: unlockedIds, lastLevelId: result.level.id });
      prevXp.current = result.totalXp;
      return;
    }

    const newBadges = result.badges.filter(
      (b) => b.status === 'unlocked' && !stored.seenBadges.includes(b.def.id)
    );
    newBadges.forEach((b) => {
      pushToast({
        kind: 'badge',
        title: `Badge unlocked: ${b.def.name}`,
        detail: `+${b.def.xpBonus} XP`,
        tierColor: b.def.tier === 'gold' ? '#F5C542' : b.def.tier === 'silver' ? '#A8B2C1' : '#CD7F32',
      });
    });

    // Only celebrate upward level changes, and never on a first baseline.
    const levelWentUp =
      stored.lastLevelId !== null &&
      stored.lastLevelId !== result.level.id &&
      result.totalXp > 0;
    if (levelWentUp) {
      pushToast({ kind: 'level', title: `Level up: ${result.level.name}` });
    }

    // Merge quick successive XP gains into one toast.
    if (prevXp.current !== null && result.totalXp > prevXp.current) {
      const gain = result.totalXp - prevXp.current;
      if (pendingXpToast.current.timer !== null) {
        window.clearTimeout(pendingXpToast.current.timer);
      }
      pendingXpToast.current.amount += gain;
      pendingXpToast.current.timer = window.setTimeout(() => {
        const amount = pendingXpToast.current.amount;
        pendingXpToast.current.amount = 0;
        pendingXpToast.current.timer = null;
        if (amount > 0 && newBadges.length === 0) {
          pushToast({ kind: 'xp', title: `+${amount} XP` });
        }
      }, 1200);
    }
    prevXp.current = result.totalXp;

    // Forget badges that are no longer unlocked (e.g. after a demo data reset),
    // but never toast on a decrease.
    const nextSeen = unlockedIds.filter(
      (id) => stored.seenBadges.includes(id) || newBadges.some((b) => b.def.id === id)
    );
    const changed =
      newBadges.length > 0 ||
      nextSeen.length !== stored.seenBadges.length ||
      (levelWentUp && result.level.id !== stored.lastLevelId);
    if (changed) {
      setStored((prev) => ({
        seenBadges: nextSeen,
        lastLevelId: levelWentUp || prev.lastLevelId === null ? result.level.id : prev.lastLevelId,
      }));
    }
  }, [result, stored.seenBadges, stored.lastLevelId, pushToast]);

  // Auto-dismiss toasts after 4 seconds.
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 4000)
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const resetGamificationState = useCallback(() => {
    setStored({ seenBadges: [], lastLevelId: null });
    isBaselineRun.current = true;
    prevXp.current = null;
    setToasts([]);
    resetToDemo();
  }, [resetToDemo]);

  const value = useMemo<GamificationContextValue>(
    () => ({
      ...result,
      toasts,
      dismissToast,
      resetGamificationState,
    }),
    [result, toasts, dismissToast, resetGamificationState]
  );

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
}

export function useGamification(): GamificationContextValue {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
}

export { useGamification }

export { GamificationProvider }