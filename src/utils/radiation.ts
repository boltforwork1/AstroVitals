import type { DailyRecord } from '@/types/health';
import {
  CAREER_LIMIT_MSV,
  SHELTER_DOSE_REDUCTION,
  SHELTER_DURATION_MS,
  STORM_LEVELS,
  type StormLevel,
} from '@/data/radiationConfig';

export function roundDose(value: number): number {
  return Math.round(value * 100) / 100;
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function sumDose(records: DailyRecord[]): number {
  return roundDose(records.reduce((sum, r) => sum + r.radiationDose, 0));
}

export function percentChange(current: number | null, baseline: number | null): number | null {
  if (current === null || baseline === null || baseline === 0) return null;
  return ((current - baseline) / baseline) * 100;
}

export function stormUnprotectedDose(level: StormLevel): number {
  return STORM_LEVELS[level].extraDoseMsv;
}

export function stormDose(level: StormLevel, sheltered: boolean): number {
  const base = stormUnprotectedDose(level);
  return roundDose(sheltered ? base * (1 - SHELTER_DOSE_REDUCTION) : base);
}

// Demo scale: mSv per minute at a fraction (0 to 1) of the shelter phase.
// The rate rises linearly so the average over the phase equals the storm's unprotected dose.
export function ambientStormRate(level: StormLevel, fraction: number): number {
  const minutes = SHELTER_DURATION_MS / 60000;
  return (2 * stormUnprotectedDose(level) * fraction) / minutes;
}

export function projectTotal(cumulative: number, dailyRate: number, remainingDays: number): number {
  return roundDose(cumulative + dailyRate * remainingDays);
}

export interface DoseProjection {
  cumulative: number;
  recentAverage: number;
  remainingDays: number;
  projectedTotal: number;
  percentOfLimit: number;
}

export function projectDose(records: DailyRecord[], missionLength: number): DoseProjection {
  const cumulative = sumDose(records);
  const recentAverage = roundDose(average(records.slice(-14).map((r) => r.radiationDose)) ?? 0);
  const latestDay = records[records.length - 1]?.missionDay ?? 0;
  const remainingDays = Math.max(0, missionLength - latestDay);
  const projectedTotal = projectTotal(cumulative, recentAverage, remainingDays);
  return {
    cumulative,
    recentAverage,
    remainingDays,
    projectedTotal,
    percentOfLimit: (projectedTotal / CAREER_LIMIT_MSV) * 100,
  };
}

export interface DoseChartRow {
  missionDay: number;
  daily?: number;
  cumulative?: number;
  projected?: number;
  stormMarker?: number;
}

export function buildDoseSeries(
  records: DailyRecord[],
  recentAverage: number,
  missionLength: number,
  stormDays: Set<number>
): DoseChartRow[] {
  let running = 0;
  const rows: DoseChartRow[] = records.map((r) => {
    running = roundDose(running + r.radiationDose);
    return {
      missionDay: r.missionDay,
      daily: r.radiationDose,
      cumulative: running,
      stormMarker: stormDays.has(r.missionDay) ? r.radiationDose : undefined,
    };
  });

  const last = rows[rows.length - 1];
  if (!last || last.cumulative === undefined) return rows;
  last.projected = last.cumulative;
  for (let day = last.missionDay + 1; day <= missionLength; day++) {
    rows.push({
      missionDay: day,
      projected: roundDose(last.cumulative + recentAverage * (day - last.missionDay)),
    });
  }
  return rows;
}
