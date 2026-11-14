import type { DailyRecord } from '@/types/health';
import { indicators } from '@/data/indicators';
import { EXERCISE_BY_ID, type ExerciseId, type Intensity } from '@/data/exercises';
import { getTrend } from './trend';

export const DAILY_TARGET_MINUTES = 120;
const BONES_LOW_DAYS = 3;
const BONES_EXTRA_MINUTES = 15;
const SHORT_SLEEP_HOURS = 6;
const HEART_TREND_PERCENT = 5;
const LOW_MOOD = 3.2;
const MOOD_CARDIO_MINUTES = 10;
const REDUCED_LOAD_FACTOR = 0.8;
const MIN_ITEM_MINUTES = 5;
const EXTRA_ITEM_MINUTES = 30;

export type PlanRole = 'warmup' | 'main' | 'mood' | 'stretch' | 'extra';

export interface PlanItem {
  exerciseId: ExerciseId;
  minutes: number;
  intensity: Intensity;
  role: PlanRole;
}

export interface TrainingPlan {
  items: PlanItem[];
  targetMinutes: number;
  reasons: string[];
}

const BASE_PLAN: { exerciseId: ExerciseId; role: PlanRole }[] = [
  { exerciseId: 'balance', role: 'warmup' },
  { exerciseId: 'squat', role: 'main' },
  { exerciseId: 'deadlift', role: 'main' },
  { exerciseId: 'bench', role: 'main' },
  { exerciseId: 'row', role: 'main' },
  { exerciseId: 'heelRaise', role: 'main' },
  { exerciseId: 'treadmill', role: 'main' },
  { exerciseId: 'cycle', role: 'main' },
  { exerciseId: 'plank', role: 'main' },
  { exerciseId: 'stretch', role: 'stretch' },
];

function planItemFor(exerciseId: ExerciseId, role: PlanRole, minutes?: number): PlanItem {
  const exercise = EXERCISE_BY_ID[exerciseId];
  return {
    exerciseId,
    role,
    minutes: minutes ?? exercise.defaultMinutes,
    intensity: exercise.intensity,
  };
}

export function extraPlanItem(exerciseId: ExerciseId): PlanItem {
  return planItemFor(exerciseId, 'extra', EXTRA_ITEM_MINUTES);
}

function fitToTarget(items: PlanItem[], target: number): PlanItem[] {
  const diff = target - items.reduce((sum, i) => sum + i.minutes, 0);
  if (diff === 0 || items.length === 0) return items;
  const largest = items.reduce((best, item, i) => (item.minutes > items[best].minutes ? i : best), 0);
  return items.map((item, i) =>
    i === largest ? { ...item, minutes: Math.max(MIN_ITEM_MINUTES, item.minutes + diff) } : item
  );
}

function boneRank(item: PlanItem): number {
  if (item.role === 'warmup') return -1;
  const exercise = EXERCISE_BY_ID[item.exerciseId];
  return exercise.category === 'resistance' && exercise.targets.includes('bones') ? 0 : 1;
}

// Rule-based daily plan built from the latest record and recent history.
export function generatePlan(records: DailyRecord[]): TrainingPlan {
  const latest = records[records.length - 1];
  const exerciseMin = indicators.exercise.normalRange.min;
  const reasons: string[] = [];
  let target = DAILY_TARGET_MINUTES;
  let items = BASE_PLAN.map((b) => planItemFor(b.exerciseId, b.role));

  const recent = records.slice(-BONES_LOW_DAYS);
  const bonesLow = recent.length === BONES_LOW_DAYS && recent.every((r) => r.exercise < exerciseMin);
  if (bonesLow) {
    items = items
      .map((item) =>
        item.exerciseId === 'deadlift' ? { ...item, minutes: item.minutes + BONES_EXTRA_MINUTES } : item
      )
      .sort((a, b) => boneRank(a) - boneRank(b));
    target += BONES_EXTRA_MINUTES;
    reasons.push(
      `Bones need loading: exercise has been below target for ${BONES_LOW_DAYS} days, so bone-loading resistance comes first with 15 extra minutes.`
    );
  }

  if (latest.mood < LOW_MOOD) {
    items = [...items, planItemFor('cycle', 'mood', MOOD_CARDIO_MINUTES)].map((item) =>
      item.role === 'mood' ? { ...item, intensity: 'low' } : item
    );
    target += MOOD_CARDIO_MINUTES;
    reasons.push('Mood is low today, so an easy cycle session is added. Gentle exercise often lifts mood.');
  }

  const sleepShort = latest.sleep < SHORT_SLEEP_HOURS;
  const heartTrend = getTrend(records, 'heartRate');
  const heartUp = heartTrend.direction === 'up' && heartTrend.percent > HEART_TREND_PERCENT;
  if (sleepShort || heartUp) {
    const causes = [
      sleepShort ? 'your sleep is short' : null,
      heartUp ? 'your heart rate is trending up' : null,
    ].filter((c): c is string => c !== null);
    reasons.push(`Lower load today because ${causes.join(' and ')}: intensity is eased and the total is 20% lower.`);
    items = items.map((item) => ({
      ...item,
      intensity: item.intensity === 'high' ? 'moderate' : item.intensity,
      minutes: Math.max(MIN_ITEM_MINUTES, Math.round(item.minutes * REDUCED_LOAD_FACTOR)),
    }));
    target = Math.round(target * REDUCED_LOAD_FACTOR);
    items = fitToTarget(items, target);
  }

  const baseReasons = [
    `Standard ISS-like day: ${DAILY_TARGET_MINUTES} minutes with warm-up and stretching included.`,
    'Resistance work loads bones and muscles, while aerobic work keeps the heart conditioned.',
  ];

  return {
    items,
    targetMinutes: target,
    reasons: [...reasons, ...baseReasons].slice(0, 3),
  };
}
