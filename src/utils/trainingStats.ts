import type { DailyRecord } from '@/types/health';
import { DAILY_TARGET_MINUTES } from './trainingPlan';

export const STREAK_RATIO = 0.8;
export const STREAK_MINUTES = DAILY_TARGET_MINUTES * STREAK_RATIO;

export interface WeekDay {
  label: string;
  minutes: number;
  onTrack: boolean;
}

export function lastWeekMinutes(records: DailyRecord[]): WeekDay[] {
  return records.slice(-7).map((r) => ({
    label: `D${r.missionDay}`,
    minutes: r.exercise,
    onTrack: r.exercise >= STREAK_MINUTES,
  }));
}

export function onTrackStreak(records: DailyRecord[]): number {
  let streak = 0;
  for (let i = records.length - 1; i >= 0 && records[i].exercise >= STREAK_MINUTES; i--) {
    streak++;
  }
  return streak;
}
