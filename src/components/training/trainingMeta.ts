import { Bike, Dumbbell, PersonStanding, Scale } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ExerciseCategory, ExerciseTarget, Intensity } from '@/data/exercises';

export const CATEGORY_META: Record<ExerciseCategory, { label: string; icon: LucideIcon }> = {
  resistance: { label: 'Resistance', icon: Dumbbell },
  cardio: { label: 'Cardio', icon: Bike },
  balance: { label: 'Balance', icon: Scale },
  flexibility: { label: 'Flexibility', icon: PersonStanding },
};

export const INTENSITY_META: Record<Intensity, { label: string; color: string }> = {
  low: { label: 'Low', color: '#22D3EE' },
  moderate: { label: 'Moderate', color: '#F59E0B' },
  high: { label: 'High', color: '#EF4444' },
};

export const TARGET_META: Record<ExerciseTarget, { label: string; color: string }> = {
  bones: { label: 'Bones', color: '#E2E8F0' },
  muscles: { label: 'Muscles', color: '#22C55E' },
  heart: { label: 'Heart', color: '#F472B6' },
};
