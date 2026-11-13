export type IndicatorKey =
  | 'heartRate'
  | 'systolic'
  | 'diastolic'
  | 'glucose'
  | 'temperature'
  | 'sleep'
  | 'mood'
  | 'exercise';

export type Status = 'normal' | 'caution' | 'critical';

export interface Range {
  min: number;
  max: number;
}

export interface Indicator {
  key: IndicatorKey;
  label: string;
  unit: string;
  normalRange: Range;
  cautionRange: Range;
  icon: string;
  description: string;
}

export interface DailyRecord {
  date: string;
  missionDay: number;
  heartRate: number;
  systolic: number;
  diastolic: number;
  glucose: number;
  temperature: number;
  sleep: number;
  mood: number;
  exercise: number;
  radiationDose: number;
}

export interface CrewMember {
  name: string;
  role: string;
  missionLength: number;
}
