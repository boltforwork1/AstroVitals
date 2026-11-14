import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Tone } from '@/utils/tone';
import { analyzeTone } from '@/utils/tone';

const STORAGE_KEY = 'astrovitals_wellbeing';

export interface JournalEntry {
  id: string;
  missionDay: number;
  date: string;
  text: string;
  tone: Tone;
}

export interface PulseResult {
  id: string;
  missionDay: number;
  date: string;
  answers: number[];
  score: number;
}

export type SessionType = 'breathing' | 'grounding' | 'connection';

export interface SessionRecord {
  id: string;
  type: SessionType;
  missionDay: number;
  durationSec: number;
}

interface WellbeingContextValue {
  journalEntries: JournalEntry[];
  pulseResults: PulseResult[];
  sessions: SessionRecord[];
  addJournalEntry: (text: string, missionDay: number) => void;
  deleteJournalEntry: (id: string) => void;
  addPulseResult: (answers: number[], score: number, missionDay: number) => void;
  addSession: (type: SessionType, durationSec: number, missionDay: number) => void;
}

const WellbeingContext = createContext<WellbeingContextValue | null>(null);

interface StoredData {
  journalEntries: JournalEntry[];
  pulseResults: PulseResult[];
  sessions: SessionRecord[];
}

const EMPTY: StoredData = { journalEntries: [], pulseResults: [], sessions: [] };

function loadData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredData>;
      if (parsed && typeof parsed === 'object') {
        return {
          journalEntries: Array.isArray(parsed.journalEntries) ? parsed.journalEntries : [],
          pulseResults: Array.isArray(parsed.pulseResults) ? parsed.pulseResults : [],
          sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        };
      }
    }
  } catch {
    // Unreadable storage falls back to empty state.
  }
  return EMPTY;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function WellbeingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoredData>(loadData);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage may be unavailable; state still works for this session.
    }
  }, [data]);

  const value = useMemo<WellbeingContextValue>(() => ({
    journalEntries: data.journalEntries,
    pulseResults: data.pulseResults,
    sessions: data.sessions,
    addJournalEntry: (text, missionDay) => {
      const { tone } = analyzeTone(text);
      const entry: JournalEntry = { id: uid(), missionDay, date: todayISO(), text, tone };
      setData((prev) => ({ ...prev, journalEntries: [...prev.journalEntries, entry] }));
    },
    deleteJournalEntry: (id) => {
      setData((prev) => ({
        ...prev,
        journalEntries: prev.journalEntries.filter((e) => e.id !== id),
      }));
    },
    addPulseResult: (answers, score, missionDay) => {
      const result: PulseResult = { id: uid(), missionDay, date: todayISO(), answers, score };
      setData((prev) => ({ ...prev, pulseResults: [...prev.pulseResults, result] }));
    },
    addSession: (type, durationSec, missionDay) => {
      const session: SessionRecord = { id: uid(), type, missionDay, durationSec };
      setData((prev) => ({ ...prev, sessions: [...prev.sessions, session] }));
    },
  }), [data]);

  return <WellbeingContext.Provider value={value}>{children}</WellbeingContext.Provider>;
}

export function useWellbeing(): WellbeingContextValue {
  const ctx = useContext(WellbeingContext);
  if (!ctx) throw new Error('useWellbeing must be used within WellbeingProvider');
  return ctx;
}
