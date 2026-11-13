import type { IndicatorKey } from './health';

export type AlertLevel = 'info' | 'caution' | 'critical';

export type AlertKind = 'threshold' | 'streak' | 'trend' | 'prediction' | 'combined';

export interface Alert {
  id: string;
  level: AlertLevel;
  kind: AlertKind;
  indicatorKeys: IndicatorKey[];
  title: string;
  message: string;
  actions: string[];
  escalate: boolean;
  createdMissionDay: number;
  dayCount?: number;
  daysToCross?: number;
  projectedValue?: number;
}

export interface AlertState extends Alert {
  acknowledged: boolean;
}
