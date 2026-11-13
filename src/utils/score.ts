import type { DailyRecord, IndicatorKey, Status } from '@/types/health';
import { indicators } from '@/data/indicators';
import { statusColor } from './status';

const WEIGHTS: Record<IndicatorKey, number> = {
  sleep: 20,
  heartRate: 15,
  systolic: 10,
  diastolic: 10,
  glucose: 10,
  temperature: 10,
  mood: 15,
  exercise: 10,
};

export function scoreForIndicator(key: IndicatorKey, value: number): number {
  const { normalRange, cautionRange } = indicators[key];

  if (value >= normalRange.min && value <= normalRange.max) {
    return 100;
  }

  if (value >= cautionRange.min && value <= cautionRange.max) {
    if (value < normalRange.min) {
      const span = normalRange.min - cautionRange.min;
      const dist = normalRange.min - value;
      return Math.round(100 - (dist / span) * 40);
    }
    const span = cautionRange.max - normalRange.max;
    const dist = value - normalRange.max;
    return Math.round(100 - (dist / span) * 40);
  }

  if (value < cautionRange.min) {
    const span = cautionRange.min - 0;
    const dist = cautionRange.min - value;
    return Math.round(Math.max(20, 60 - (dist / span) * 40));
  }

  const span = 1000;
  const dist = value - cautionRange.max;
  return Math.round(Math.max(20, 60 - (dist / span) * 40));
}

export function calculateHealthScore(record: DailyRecord): number {
  let totalScore = 0;
  let totalWeight = 0;

  (Object.keys(WEIGHTS) as IndicatorKey[]).forEach((key) => {
    const weight = WEIGHTS[key];
    const score = scoreForIndicator(key, record[key]);
    totalScore += score * weight;
    totalWeight += weight;
  });

  return Math.round(totalScore / totalWeight);
}

export function getScoreLabel(score: number): { label: string; status: Status; color: string } {
  if (score >= 85) return { label: 'Excellent', status: 'normal', color: statusColor('normal') };
  if (score >= 70) return { label: 'Good', status: 'normal', color: statusColor('normal') };
  if (score >= 50) return { label: 'Needs attention', status: 'caution', color: statusColor('caution') };
  return { label: 'Critical', status: 'critical', color: statusColor('critical') };
}
