import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRecords } from './RecordsContext';
import {
  SHELTER_DURATION_MS,
  STORM_LEVELS,
  WARNING_DURATION_MS,
  type StormLevel,
} from '@/data/radiationConfig';
import { roundDose, stormDose } from '@/utils/radiation';

const STORAGE_KEY = 'astrovitals_storms';

export type StormPhase = 'warning' | 'shelter' | 'recovery';

export interface ActiveStorm {
  id: string;
  level: StormLevel;
  missionDay: number;
  startedAt: number;
  phase: StormPhase;
  phaseStartedAt: number;
  sheltered: boolean;
  checkedItems: string[];
}

export interface StormEvent {
  id: string;
  level: StormLevel;
  missionDay: number;
  extraDose: number;
  sheltered: boolean;
}

interface StormContextValue {
  activeStorm: ActiveStorm | null;
  history: StormEvent[];
  startStorm: (level: StormLevel) => void;
  toggleShelterItem: (itemId: string) => void;
  markSheltered: () => void;
  skipToRecovery: () => void;
  cancelStorm: () => void;
  endStorm: () => void;
}

const StormContext = createContext<StormContextValue | null>(null);

function isStormEvent(value: unknown): value is StormEvent {
  if (typeof value !== 'object' || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.level === 'string' &&
    e.level in STORM_LEVELS &&
    typeof e.missionDay === 'number' &&
    typeof e.extraDose === 'number' &&
    typeof e.sheltered === 'boolean'
  );
}

function loadHistory(): StormEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(isStormEvent);
    }
  } catch {
    // Unreadable storage falls back to an empty history.
  }
  return [];
}

export function StormProvider({ children }: { children: ReactNode }) {
  const { records, updateRecord } = useRecords();
  const [activeStorm, setActiveStorm] = useState<ActiveStorm | null>(null);
  const [history, setHistory] = useState<StormEvent[]>(loadHistory);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Storage may be unavailable; history still works for this session.
    }
  }, [history]);

  const stormId = activeStorm?.id;
  const phase = activeStorm?.phase;
  const phaseStartedAt = activeStorm?.phaseStartedAt;

  useEffect(() => {
    if (!stormId || !phase || phaseStartedAt === undefined || phase === 'recovery') return;
    const duration = phase === 'warning' ? WARNING_DURATION_MS : SHELTER_DURATION_MS;
    const remaining = Math.max(0, duration - (Date.now() - phaseStartedAt));
    const timer = window.setTimeout(() => {
      setActiveStorm((prev) => {
        if (!prev || prev.id !== stormId || prev.phase !== phase) return prev;
        const now = Date.now();
        return prev.phase === 'warning'
          ? { ...prev, phase: 'shelter', phaseStartedAt: now }
          : { ...prev, phase: 'recovery', phaseStartedAt: now };
      });
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [stormId, phase, phaseStartedAt]);

  const startStorm = useCallback(
    (level: StormLevel) => {
      if (activeStorm) return;
      const now = Date.now();
      setActiveStorm({
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        level,
        missionDay: records[records.length - 1].missionDay,
        startedAt: now,
        phase: 'warning',
        phaseStartedAt: now,
        sheltered: false,
        checkedItems: [],
      });
    },
    [activeStorm, records]
  );

  const toggleShelterItem = useCallback((itemId: string) => {
    setActiveStorm((prev) => {
      if (!prev || prev.phase !== 'shelter') return prev;
      const checkedItems = prev.checkedItems.includes(itemId)
        ? prev.checkedItems.filter((id) => id !== itemId)
        : [...prev.checkedItems, itemId];
      return { ...prev, checkedItems };
    });
  }, []);

  const markSheltered = useCallback(() => {
    setActiveStorm((prev) =>
      prev && prev.phase === 'shelter' && !prev.sheltered ? { ...prev, sheltered: true } : prev
    );
  }, []);

  const skipToRecovery = useCallback(() => {
    const now = Date.now();
    setActiveStorm((prev) =>
      prev && prev.phase !== 'recovery' ? { ...prev, phase: 'recovery', phaseStartedAt: now } : prev
    );
  }, []);

  const cancelStorm = useCallback(() => setActiveStorm(null), []);

  const endStorm = useCallback(() => {
    if (!activeStorm) return;
    const extraDose = stormDose(activeStorm.level, activeStorm.sheltered);
    const record = records.find((r) => r.missionDay === activeStorm.missionDay);
    if (record) {
      updateRecord(record.missionDay, { radiationDose: roundDose(record.radiationDose + extraDose) });
    }
    setHistory((prev) => [
      ...prev,
      {
        id: activeStorm.id,
        level: activeStorm.level,
        missionDay: activeStorm.missionDay,
        extraDose,
        sheltered: activeStorm.sheltered,
      },
    ]);
    setActiveStorm(null);
  }, [activeStorm, records, updateRecord]);

  const value = useMemo<StormContextValue>(
    () => ({
      activeStorm,
      history,
      startStorm,
      toggleShelterItem,
      markSheltered,
      skipToRecovery,
      cancelStorm,
      endStorm,
    }),
    [activeStorm, history, startStorm, toggleShelterItem, markSheltered, skipToRecovery, cancelStorm, endStorm]
  );

  return <StormContext.Provider value={value}>{children}</StormContext.Provider>;
}

export function useStorm(): StormContextValue {
  const ctx = useContext(StormContext);
  if (!ctx) throw new Error('useStorm must be used within StormProvider');
  return ctx;
}
