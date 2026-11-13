import type { DailyRecord, IndicatorKey } from '@/types/health';

export interface TrendResult {
  direction: 'up' | 'down' | 'flat';
  percent: number;
}

export function getTrend(records: DailyRecord[], key: IndicatorKey): TrendResult {
  if (records.length < 4) {
    return { direction: 'flat', percent: 0 };
  }

  const last3 = records.slice(-3);
  const prev7 = records.slice(-10, -3);

  if (prev7.length === 0) {
    return { direction: 'flat', percent: 0 };
  }

  const avgLast3 = last3.reduce((sum, r) => sum + r[key], 0) / last3.length;
  const avgPrev7 = prev7.reduce((sum, r) => sum + r[key], 0) / prev7.length;

  if (avgPrev7 === 0) {
    return { direction: 'flat', percent: 0 };
  }

  const percent = ((avgLast3 - avgPrev7) / avgPrev7) * 100;
  const absPercent = Math.abs(percent);

  if (absPercent < 1.5) {
    return { direction: 'flat', percent: 0 };
  }

  return {
    direction: percent > 0 ? 'up' : 'down',
    percent: Math.round(absPercent * 10) / 10,
  };
}
