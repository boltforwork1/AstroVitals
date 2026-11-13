import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AlertLevel, AlertState } from '@/types/alerts';
import { useRecords } from './RecordsContext';
import { ALERT_LEVEL_RANK, generateAlerts } from '@/utils/alerts';

const STORAGE_KEY = 'astrovitals_alerts_state';

interface StoredAlertsState {
  acknowledged: Record<string, AlertLevel>;
  snoozed: Record<string, { untilDay: number; level: AlertLevel }>;
}

interface AlertsContextValue {
  alerts: AlertState[];
  counts: Record<AlertLevel, number>;
  unreadCount: number;
  unreadCriticalCount: number;
  acknowledge: (id: string) => void;
  acknowledgeAll: () => void;
  snooze: (id: string) => void;
}

const AlertsContext = createContext<AlertsContextValue | null>(null);

const EMPTY_STATE: StoredAlertsState = { acknowledged: {}, snoozed: {} };

function loadState(): StoredAlertsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredAlertsState> | null;
      if (parsed && typeof parsed === 'object') {
        return { acknowledged: parsed.acknowledged ?? {}, snoozed: parsed.snoozed ?? {} };
      }
    }
  } catch {
    // Unreadable storage falls back to a clean state.
  }
  return EMPTY_STATE;
}

export function AlertsProvider({ children }: { children: ReactNode }) {
  const { records } = useRecords();
  const [stored, setStored] = useState<StoredAlertsState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // Storage may be unavailable; state still works for this session.
    }
  }, [stored]);

  const value = useMemo<AlertsContextValue>(() => {
    const latestDay = records[records.length - 1].missionDay;
    const generated = generateAlerts(records);
    const levelById = new Map(generated.map((a) => [a.id, a.level] as const));
    const levelOf = (id: string) => levelById.get(id);

    // An alert is acknowledged only while its level has not risen since acknowledgement,
    // so escalations become unread again.
    const alerts: AlertState[] = generated
      .filter((a) => {
        const snooze = stored.snoozed[a.id];
        const hidden =
          snooze !== undefined &&
          latestDay < snooze.untilDay &&
          ALERT_LEVEL_RANK[a.level] <= ALERT_LEVEL_RANK[snooze.level];
        return !hidden;
      })
      .map((a) => {
        const ack = stored.acknowledged[a.id];
        return {
          ...a,
          acknowledged: ack !== undefined && ALERT_LEVEL_RANK[ack] >= ALERT_LEVEL_RANK[a.level],
        };
      });

    const counts: Record<AlertLevel, number> = { info: 0, caution: 0, critical: 0 };
    alerts.forEach((a) => {
      counts[a.level] += 1;
    });
    const unread = alerts.filter((a) => !a.acknowledged);

    const acknowledge = (id: string) => {
      const level = levelOf(id);
      if (!level) return;
      setStored((prev) => ({ ...prev, acknowledged: { ...prev.acknowledged, [id]: level } }));
    };

    const acknowledgeAll = () => {
      setStored((prev) => ({
        ...prev,
        acknowledged: {
          ...prev.acknowledged,
          ...Object.fromEntries(alerts.map((a) => [a.id, a.level])),
        },
      }));
    };

    const snooze = (id: string) => {
      const level = levelOf(id);
      if (!level) return;
      setStored((prev) => ({
        ...prev,
        snoozed: { ...prev.snoozed, [id]: { untilDay: latestDay + 1, level } },
      }));
    };

    return {
      alerts,
      counts,
      unreadCount: unread.length,
      unreadCriticalCount: unread.filter((a) => a.level === 'critical').length,
      acknowledge,
      acknowledgeAll,
      snooze,
    };
  }, [records, stored]);

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
}

export function useAlerts(): AlertsContextValue {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertsProvider');
  return ctx;
}
