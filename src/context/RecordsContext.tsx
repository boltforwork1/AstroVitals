import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { DailyRecord } from '@/types/health';
import { mockRecords } from '@/data/mockRecords';

const STORAGE_KEY = 'astrovitals_records';

interface RecordsContextValue {
  records: DailyRecord[];
  latestRecord: DailyRecord;
  addRecord: (record: DailyRecord) => void;
  updateRecord: (missionDay: number, record: Partial<DailyRecord>) => void;
  resetToDemo: () => void;
}

const RecordsContext = createContext<RecordsContextValue | null>(null);

function loadRecords(): DailyRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isValidRecord)) {
        return parsed.sort((a, b) => a.date.localeCompare(b.date));
      }
    }
  } catch {
    // fall through to demo data
  }
  return mockRecords;
}

function isValidRecord(r: unknown): r is DailyRecord {
  if (typeof r !== 'object' || r === null) return false;
  const rec = r as Record<string, unknown>;
  return typeof rec.date === 'string' && typeof rec.missionDay === 'number';
}

function sortRecords(records: DailyRecord[]): DailyRecord[] {
  return [...records].sort((a, b) => a.date.localeCompare(b.date));
}

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<DailyRecord[]>(loadRecords);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // storage full or unavailable — keep working in memory
    }
  }, [records]);

  const value = useMemo<RecordsContextValue>(() => {
    return {
      records,
      latestRecord: records[records.length - 1],
      addRecord: (record) => setRecords((prev) => sortRecords([...prev, record])),
      updateRecord: (missionDay, patch) =>
        setRecords((prev) =>
          sortRecords(
            prev.map((r) => (r.missionDay === missionDay ? { ...r, ...patch } : r))
          )
        ),
      resetToDemo: () => setRecords(mockRecords),
    };
  }, [records]);

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function useRecords(): RecordsContextValue {
  const ctx = useContext(RecordsContext);
  if (!ctx) throw new Error('useRecords must be used within RecordsProvider');
  return ctx;
}
