import type { DailyRecord } from '@/types/health';
import { getTrend } from './trend';
import { detectIsolationSignals } from './tone';
import type { JournalEntry, SessionRecord } from '@/context/WellbeingContext';

export interface WellbeingSignal {
  id: string;
  label: string;
  detail: string;
  level: 'caution' | 'info';
}

export function buildWellbeingSignals(
  records: DailyRecord[],
  journalEntries: JournalEntry[],
  sessions: SessionRecord[]
): WellbeingSignal[] {
  const signals: WellbeingSignal[] = [];

  if (records.length >= 4) {
    const moodTrend = getTrend(records, 'mood');
    if (moodTrend.direction === 'down' && moodTrend.percent >= 5) {
      signals.push({
        id: 'mood-drop',
        label: `Mood has dropped ${moodTrend.percent}% this week`,
        detail: 'Your mood score is trending downward compared to the previous 7 days.',
        level: 'caution',
      });
    }
  }

  if (records.length >= 4) {
    const moodTrend = getTrend(records, 'mood');
    const sleepTrend = getTrend(records, 'sleep');
    if (moodTrend.direction === 'down' && sleepTrend.direction === 'down') {
      signals.push({
        id: 'sleep-mood',
        label: 'Sleep and mood are falling together',
        detail: 'Both sleep duration and mood are trending down. Poor sleep often drags mood with it.',
        level: 'caution',
      });
    }
  }

  if (detectIsolationSignals(journalEntries)) {
    signals.push({
      id: 'low-tone',
      label: 'Low-tone journal entries recently',
      detail: 'Several recent journal entries use words that suggest low mood or isolation.',
      level: 'caution',
    });
  }

  const latestDay = records[records.length - 1]?.missionDay ?? 0;
  const hasConnection = sessions.some(
    (s) => s.type === 'connection' && s.missionDay >= latestDay - 6
  );
  if (!hasConnection) {
    signals.push({
      id: 'no-connection',
      label: 'No crew connection session this week',
      detail: 'You have not logged a crew connection activity in the last 7 mission days.',
      level: 'info',
    });
  }

  return signals;
}
