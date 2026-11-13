import type { DailyRecord, IndicatorKey } from '@/types/health';
import type { Alert, AlertKind, AlertLevel } from '@/types/alerts';
import { indicators } from '@/data/indicators';
import { getStatus, statusColor } from './status';
import { getTrend, type TrendResult } from './trend';
import { linearForecast } from './forecast';

// Demo heuristics only. The thresholds and rules below are simplified for this
// demo and are not clinical standards or a medical diagnostic tool.

export const PREDICTION_SAMPLE_DAYS = 10;
export const PREDICTION_HORIZON_DAYS = 7;
const PREDICTION_MIN_POINTS = 5;
const PREDICTION_WINDOW_DAYS = 10;
const PREDICTION_MIN_R2 = 0.3;
const PREDICTION_MIN_SLOPE_SHARE = 0.005;
const STREAK_CAUTION_DAYS = 3;
const STREAK_CRITICAL_DAYS = 6;
const TREND_PERCENT = 8;
const COMBINED_TREND_PERCENT = 3;

export const ALERT_LEVEL_RANK: Record<AlertLevel, number> = { info: 0, caution: 1, critical: 2 };
export const ALERT_LEVEL_LABEL: Record<AlertLevel, string> = {
  info: 'Info',
  caution: 'Caution',
  critical: 'Critical',
};
export const ALERT_KIND_LABEL: Record<AlertKind, string> = {
  threshold: 'Threshold',
  streak: 'Streak',
  trend: 'Trend',
  prediction: 'Prediction',
  combined: 'Combined',
};

const KIND_RANK: Record<AlertKind, number> = {
  threshold: 0,
  streak: 1,
  combined: 2,
  trend: 3,
  prediction: 4,
};

const INDICATOR_KEYS = Object.keys(indicators) as IndicatorKey[];

const UNHEALTHY_TREND: Partial<Record<IndicatorKey, 'up' | 'down'>> = {
  sleep: 'down',
  exercise: 'down',
  mood: 'down',
  heartRate: 'up',
  systolic: 'up',
};

const ACTIONS: Record<IndicatorKey, string[]> = {
  heartRate: [
    'Drink water with your usual meals.',
    'Take 5 minutes of slow breathing before rest.',
    'Recheck heart rate at the same time tomorrow.',
  ],
  systolic: [
    'Recheck blood pressure after 5 minutes of seated rest.',
    'Cut back on salt at the next meals.',
    'Report any dizziness to the flight surgeon.',
  ],
  diastolic: [
    'Recheck blood pressure after 5 minutes of seated rest.',
    'Hydrate and avoid strenuous work until the reading settles.',
    'Report any dizziness to the flight surgeon.',
  ],
  glucose: [
    'Eat balanced meals at regular times.',
    'Recheck fasting glucose tomorrow morning.',
    'Avoid sugary snacks between meals.',
  ],
  temperature: [
    'Recheck temperature this evening.',
    'Rest and drink fluids.',
    'Report fever or chills to the flight surgeon.',
  ],
  sleep: [
    'Keep a fixed sleep window, same bedtime and wake time.',
    'Dim cabin lights 1 hour before sleep.',
    'Log any sleep disruptions in your check-in.',
  ],
  mood: [
    'Take 5 minutes of slow breathing.',
    'Talk to the crew or ground support today.',
    'Schedule one short activity you enjoy.',
  ],
  exercise: [
    'Do the resistance session first today.',
    'Add a 20-minute aerobic block on the treadmill or cycle.',
    'Log every session so the totals are accurate.',
  ],
};

type Draft = Omit<Alert, 'createdMissionDay'>;

const round1 = (n: number) => Math.round(n * 10) / 10;

function unitText(unit: string): string {
  return unit.startsWith('/') ? unit : ` ${unit}`;
}

export function formatWithUnit(value: number, unit: string): string {
  return `${round1(value)}${unitText(unit)}`;
}

function latestValue(records: DailyRecord[], key: IndicatorKey): number {
  return records[records.length - 1][key];
}

function streakOf(
  records: DailyRecord[],
  key: IndicatorKey
): { days: number; side: 'below' | 'above' | null } {
  const { normalRange } = indicators[key];
  const sideOf = (v: number): 'below' | 'above' | null =>
    v < normalRange.min ? 'below' : v > normalRange.max ? 'above' : null;
  const today = sideOf(latestValue(records, key));
  if (!today) return { days: 0, side: null };
  let days = 0;
  for (let i = records.length - 1; i >= 0 && sideOf(records[i][key]) === today; i--) days++;
  return { days, side: today };
}

function thresholdDrafts(records: DailyRecord[]): Draft[] {
  return INDICATOR_KEYS.flatMap((key): Draft[] => {
    const value = latestValue(records, key);
    const status = getStatus(key, value);
    if (status === 'normal') return [];
    const ind = indicators[key];
    const critical = status === 'critical';
    return [
      {
        id: `${key}-threshold`,
        level: status,
        kind: 'threshold',
        indicatorKeys: [key],
        title: critical ? `${ind.label} is critically out of range` : `${ind.label} is outside target`,
        message: `${ind.label} is ${formatWithUnit(value, ind.unit)}, outside its normal range of ${ind.normalRange.min}–${ind.normalRange.max}${unitText(ind.unit)}.`,
        actions: ACTIONS[key],
        escalate: critical,
      },
    ];
  });
}

function streakDrafts(records: DailyRecord[]): Draft[] {
  return INDICATOR_KEYS.flatMap((key): Draft[] => {
    const { days, side } = streakOf(records, key);
    if (!side || days < STREAK_CAUTION_DAYS) return [];
    // Under-target exercise streaks are reported by the combined exercise rule.
    if (key === 'exercise' && side === 'below') return [];
    const ind = indicators[key];
    const critical = days >= STREAK_CRITICAL_DAYS;
    return [
      {
        id: `${key}-streak`,
        level: critical ? 'critical' : 'caution',
        kind: 'streak',
        indicatorKeys: [key],
        title: `${ind.label} out of target for ${days} days`,
        message: `${ind.label} has been ${side} its normal range for ${days} days in a row.`,
        actions: ACTIONS[key],
        escalate: critical,
        dayCount: days,
      },
    ];
  });
}

// When both exist for one indicator, keep the higher level; the streak wins ties.
function mergeThresholdAndStreak(thresholds: Draft[], streaks: Draft[]): Draft[] {
  const streakByKey = new Map(streaks.map((s) => [s.indicatorKeys[0], s] as const));
  const consumed = new Set<string>();
  const merged: Draft[] = [];

  thresholds.forEach((t) => {
    const s = streakByKey.get(t.indicatorKeys[0]);
    if (!s) {
      merged.push(t);
      return;
    }
    consumed.add(s.id);
    if (ALERT_LEVEL_RANK[t.level] > ALERT_LEVEL_RANK[s.level]) {
      merged.push({
        ...t,
        message: `${t.message} It has also been outside target for ${s.dayCount ?? 0} days in a row.`,
      });
    } else {
      merged.push(s);
    }
  });

  return [...merged, ...streaks.filter((s) => !consumed.has(s.id))];
}

function trendDrafts(records: DailyRecord[]): Draft[] {
  return (Object.keys(UNHEALTHY_TREND) as IndicatorKey[]).flatMap((key): Draft[] => {
    const dir = UNHEALTHY_TREND[key];
    const trend: TrendResult = getTrend(records, key);
    if (!dir || trend.direction !== dir || trend.percent < TREND_PERCENT) return [];
    const ind = indicators[key];
    return [
      {
        id: `${key}-trend`,
        level: 'caution',
        kind: 'trend',
        indicatorKeys: [key],
        title: `${ind.label} trending ${dir}`,
        message: `${ind.label} is ${dir} ${trend.percent}% over the last 3 days compared with the 7 days before.`,
        actions: ACTIONS[key],
        escalate: false,
      },
    ];
  });
}

function predictionDrafts(records: DailyRecord[]): Draft[] {
  const sample = records.slice(-PREDICTION_SAMPLE_DAYS);
  if (sample.length < PREDICTION_MIN_POINTS) return [];

  return INDICATOR_KEYS.flatMap((key): Draft[] => {
    const fit = linearForecast(sample.map((r) => r[key]));
    const ind = indicators[key];
    const width = ind.normalRange.max - ind.normalRange.min;
    if (fit.rSquared < PREDICTION_MIN_R2) return [];
    if (Math.abs(fit.slope) < width * PREDICTION_MIN_SLOPE_SHARE) return [];

    const status = getStatus(key, latestValue(records, key));
    if (status === 'critical') return [];

    const down = fit.slope < 0;
    const fittedNow = fit.predict(0);
    const daysUntil = (bound: number) => (bound - fittedNow) / fit.slope;
    const cautionBound = down ? ind.cautionRange.min : ind.cautionRange.max;
    const normalBound = down ? ind.normalRange.min : ind.normalRange.max;
    const cautionDays = daysUntil(cautionBound);
    const normalDays = daysUntil(normalBound);

    const cautionHit = cautionDays > 0 && cautionDays <= PREDICTION_HORIZON_DAYS;
    const normalHit =
      status === 'normal' && normalDays > 0 && normalDays <= PREDICTION_WINDOW_DAYS;
    if (!cautionHit && !normalHit) return [];

    const bound = cautionHit ? cautionBound : normalBound;
    const days = Math.max(1, Math.ceil(cautionHit ? cautionDays : normalDays));
    const verb = down ? 'drop below' : 'rise above';

    return [
      {
        id: `${key}-prediction`,
        level: cautionHit ? 'caution' : 'info',
        kind: 'prediction',
        indicatorKeys: [key],
        title: `${ind.label} projected to leave target range`,
        message: `If this trend continues, ${ind.label} is projected to ${verb} ${formatWithUnit(bound, ind.unit)} in about ${days} day${days === 1 ? '' : 's'}.`,
        actions: ACTIONS[key],
        escalate: false,
        daysToCross: days,
        projectedValue: round1(fit.predict(PREDICTION_HORIZON_DAYS)),
      },
    ];
  });
}

function combinedDrafts(records: DailyRecord[]): Draft[] {
  const drafts: Draft[] = [];
  const movingSince = (key: IndicatorKey, dir: 'up' | 'down') => {
    const trend = getTrend(records, key);
    return trend.direction === dir && trend.percent >= COMBINED_TREND_PERCENT;
  };
  const statusOfKey = (key: IndicatorKey) => getStatus(key, latestValue(records, key));

  if (movingSince('sleep', 'down') && movingSince('heartRate', 'up') && movingSince('mood', 'down')) {
    drafts.push({
      id: 'combined-stress-fatigue',
      level: 'caution',
      kind: 'combined',
      indicatorKeys: ['sleep', 'heartRate', 'mood'],
      title: 'Possible accumulated stress or fatigue',
      message:
        'Sleep and mood are falling while heart rate climbs. This pattern can signal accumulated stress or fatigue.',
      actions: [
        'Do 5 minutes of slow breathing before you rest.',
        'Keep a fixed sleep window and dim the lights 1 hour before sleep.',
        'Talk to the crew or ground support today.',
      ],
      escalate: false,
    });
  }

  const exercise = streakOf(records, 'exercise');
  if (exercise.side === 'below' && exercise.days >= STREAK_CAUTION_DAYS) {
    const critical = exercise.days >= STREAK_CRITICAL_DAYS;
    drafts.push({
      id: 'exercise-load',
      level: critical ? 'critical' : 'caution',
      kind: 'combined',
      indicatorKeys: ['exercise'],
      title: 'Daily exercise is below target',
      message: `Bone and muscle loading is below the daily target for ${exercise.days} days in a row.`,
      actions: [
        'Do the resistance session first today.',
        'Add a 20-minute aerobic block on the treadmill or cycle.',
        'Log every session so the totals are accurate.',
      ],
      escalate: critical,
    });
  }

  const bpOutOfRange = (['systolic', 'diastolic'] as const).filter(
    (key) => statusOfKey(key) !== 'normal'
  );
  if (bpOutOfRange.length > 0 && movingSince('heartRate', 'up')) {
    const critical = bpOutOfRange.some((key) => statusOfKey(key) === 'critical');
    drafts.push({
      id: 'cardiovascular-strain',
      level: critical ? 'critical' : 'caution',
      kind: 'combined',
      indicatorKeys: [...bpOutOfRange, 'heartRate'],
      title: 'Possible cardiovascular strain',
      message:
        'Blood pressure is outside target while heart rate is climbing. This can signal cardiovascular strain.',
      actions: [
        'Recheck blood pressure after 5 minutes of seated rest.',
        'Cut back on salt at the next meals and drink water.',
        'Report dizziness or chest discomfort to the flight surgeon.',
      ],
      escalate: critical,
    });
  }

  const temperatureHigh = latestValue(records, 'temperature') > indicators.temperature.cautionRange.max;
  const sleepLow = latestValue(records, 'sleep') < indicators.sleep.normalRange.min;
  if (temperatureHigh && sleepLow) {
    drafts.push({
      id: 'illness-immune',
      level: 'critical',
      kind: 'combined',
      indicatorKeys: ['temperature', 'sleep'],
      title: 'Possible illness or immune stress',
      message:
        'Body temperature is above its caution range while sleep is short. This can signal illness or immune stress.',
      actions: [
        'Recheck temperature this evening and rest.',
        'Drink fluids and avoid strenuous exercise today.',
        'Contact the flight surgeon now.',
      ],
      escalate: true,
    });
  }

  return drafts;
}

// Returns alerts sorted by level (critical first), then by kind.
export function generateAlerts(records: DailyRecord[]): Alert[] {
  if (records.length === 0) return [];
  const createdMissionDay = records[records.length - 1].missionDay;
  const drafts = [
    ...mergeThresholdAndStreak(thresholdDrafts(records), streakDrafts(records)),
    ...trendDrafts(records),
    ...predictionDrafts(records),
    ...combinedDrafts(records),
  ];
  return drafts
    .map((d) => ({ ...d, createdMissionDay }))
    .sort(
      (a, b) =>
        ALERT_LEVEL_RANK[b.level] - ALERT_LEVEL_RANK[a.level] || KIND_RANK[a.kind] - KIND_RANK[b.kind]
    );
}

export function alertLevelColor(level: AlertLevel): string {
  if (level === 'info') return '#22D3EE';
  return statusColor(level);
}
