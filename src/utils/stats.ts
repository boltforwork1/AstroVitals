import type { DailyRecord, IndicatorKey } from '@/types/health';
import { indicators } from '@/data/indicators';
import { getStatus } from './status';
import { calculateHealthScore } from './score';

export type TrendRange = 7 | 14 | 30 | 'All';

export type TrendMetric =
  | 'healthScore'
  | 'bloodPressure'
  | IndicatorKey;

export const TREND_METRICS: TrendMetric[] = [
  'healthScore',
  'bloodPressure',
  'heartRate',
  'glucose',
  'temperature',
  'sleep',
  'mood',
  'exercise',
];

export const METRIC_LABEL: Record<TrendMetric, string> = {
  healthScore: 'Health Score',
  bloodPressure: 'Blood Pressure',
  heartRate: 'Heart Rate',
  glucose: 'Glucose',
  temperature: 'Temperature',
  sleep: 'Sleep',
  mood: 'Mood',
  exercise: 'Exercise',
  systolic: 'Systolic BP',
  diastolic: 'Diastolic BP',
};

export interface SeriesPoint {
  missionDay: number;
  value: number;
}

export function getSeries(
  records: DailyRecord[],
  key: TrendMetric,
  range: TrendRange
): SeriesPoint[] {
  const sliced =
    range === 'All' ? records : records.slice(Math.max(0, records.length - range));
  return sliced.map((r) => ({
    missionDay: r.missionDay,
    value:
      key === 'healthScore'
        ? calculateHealthScore(r)
        : key === 'bloodPressure'
          ? r.systolic
          : r[key as IndicatorKey],
  }));
}

export interface MetricStats {
  min: number;
  max: number;
  average: number;
  latest: number;
  percentChange: number;
}

export function getStats(series: SeriesPoint[]): MetricStats {
  const values = series.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const average = values.reduce((s, v) => s + v, 0) / values.length;
  const latest = values[values.length - 1];

  const half = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, half);
  const secondHalf = values.slice(half);
  const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length : 0;
  const secondAvg = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;
  const percentChange = firstAvg !== 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

  return { min, max, average, latest, percentChange };
}

export function metricStatus(key: TrendMetric, value: number): 'normal' | 'caution' | 'critical' {
  if (key === 'healthScore') {
    if (value >= 85) return 'normal';
    if (value >= 70) return 'caution';
    return 'critical';
  }
  // Blood pressure has no single indicator entry; judge by systolic.
  if (key === 'bloodPressure') return getStatus('systolic', value);
  return getStatus(key as IndicatorKey, value);
}

export function countOutOfRange(
  series: SeriesPoint[],
  key: TrendMetric
): { count: number; streak: number } {
  const values = series.map((p) => p.value);
  const outOfRange = values.map((v) => metricStatus(key, v) !== 'normal');
  const count = outOfRange.filter(Boolean).length;

  let streak = 0;
  for (let i = outOfRange.length - 1; i >= 0 && outOfRange[i]; i--) {
    streak++;
  }
  return { count, streak };
}

export function normalRangeFor(key: TrendMetric): { min: number; max: number } | null {
  if (key === 'healthScore') return { min: 85, max: 100 };
  if (key === 'bloodPressure') return null;
  return indicators[key as IndicatorKey].normalRange;
}

export function cautionRangeFor(key: TrendMetric): { min: number; max: number } | null {
  if (key === 'healthScore') return { min: 70, max: 85 };
  if (key === 'bloodPressure') return null;
  return indicators[key as IndicatorKey].cautionRange;
}

export function metricUnit(key: TrendMetric): string {
  if (key === 'healthScore') return '';
  if (key === 'bloodPressure') return 'mmHg';
  return indicators[key as IndicatorKey].unit;
}

export function exportRecordsCsv(records: DailyRecord[]): void {
  const headers = [
    'date',
    'missionDay',
    'heartRate',
    'systolic',
    'diastolic',
    'glucose',
    'temperature',
    'sleep',
    'mood',
    'exercise',
    'radiationDose',
  ];
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = records.map((r) => headers.map((h) => escape(r[h as keyof DailyRecord])).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'astrovitals_records.csv';
  link.click();
  URL.revokeObjectURL(url);
}


export { exportRecordsCsv }

export { METRIC_LABEL, countOutOfRange, getStats, metricStatus }