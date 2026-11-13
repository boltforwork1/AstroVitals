import type { DailyRecord } from '@/types/health';

const STRESS_DAYS = 5;
const TARGETS = { sleep: 4.5, heartRate: 100, mood: 2.5, systolic: 135 };

type StressKey = keyof typeof TARGETS;

// Builds days that ramp from the latest record toward stressed values for demo escalation.
export function buildStressScenario(latest: DailyRecord): DailyRecord[] {
  return Array.from({ length: STRESS_DAYS }, (_, i) => {
    const t = (i + 1) / STRESS_DAYS;
    const date = new Date(`${latest.date}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + i + 1);
    const lerp = (key: StressKey) => latest[key] + (TARGETS[key] - latest[key]) * t;
    return {
      ...latest,
      date: date.toISOString().slice(0, 10),
      missionDay: latest.missionDay + i + 1,
      sleep: Math.round(lerp('sleep') * 10) / 10,
      heartRate: Math.round(lerp('heartRate')),
      mood: Math.round(lerp('mood') * 10) / 10,
      systolic: Math.round(lerp('systolic')),
    };
  });
}
