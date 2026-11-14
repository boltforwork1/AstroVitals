import { Bone, Dumbbell, Heart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { RegionId } from '@/data/bodyRegions';
import type { ExerciseTarget } from '@/data/exercises';
import type { Status } from '@/types/health';

export interface Countermeasure {
  regionId: RegionId;
  target: ExerciseTarget;
  title: string;
  icon: LucideIcon;
  statusLine: Record<Status, string>;
  whyExerciseHelps: string;
}

export const COUNTERMEASURES: Countermeasure[] = [
  {
    regionId: 'bones',
    target: 'bones',
    title: 'Bones',
    icon: Bone,
    statusLine: {
      normal: 'Bone loading is on track today.',
      caution: 'Bone loading is slipping. Prioritize resistance work.',
      critical: 'Bone loading is well below target.',
    },
    whyExerciseHelps:
      'Bones lose density without gravity loading, at roughly 1% per month in weight-bearing areas such as the hips and spine. Resistance exercise pushes against a load so bones keep the signal to stay strong.',
  },
  {
    regionId: 'muscles',
    target: 'muscles',
    title: 'Muscles',
    icon: Dumbbell,
    statusLine: {
      normal: 'Muscle activity is on track today.',
      caution: 'Muscle work is dipping. Add resistance sets.',
      critical: 'Muscle work is well below target.',
    },
    whyExerciseHelps:
      'Without gravity, postural muscles in the legs and back barely work and begin to shrink within days. Regular resistance and stretching work keeps strength and movement intact.',
  },
  {
    regionId: 'heart',
    target: 'heart',
    title: 'Heart',
    icon: Heart,
    statusLine: {
      normal: 'Heart readings are steady today.',
      caution: 'Heart readings need a closer look today.',
      critical: 'Heart readings are outside the safe range.',
    },
    whyExerciseHelps:
      'Without gravity the heart does less work and can lose conditioning over time. Aerobic work on the treadmill or cycle keeps the heart and blood vessels fit.',
  },
];
