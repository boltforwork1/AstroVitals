import type { IndicatorKey, Status } from '@/types/health';
import { indicators } from '@/data/indicators';

export function getStatus(key: IndicatorKey, value: number): Status {
  const ind = indicators[key];
  const { normalRange, cautionRange } = ind;

  if (value >= normalRange.min && value <= normalRange.max) {
    return 'normal';
  }

  if (value >= cautionRange.min && value <= cautionRange.max) {
    return 'caution';
  }

  return 'critical';
}

export function statusColor(status: Status): string {
  switch (status) {
    case 'normal':
      return '#22C55E';
    case 'caution':
      return '#F59E0B';
    case 'critical':
      return '#EF4444';
  }
}

export function statusTextClass(status: Status): string {
  switch (status) {
    case 'normal':
      return 'text-status-normal';
    case 'caution':
      return 'text-status-caution';
    case 'critical':
      return 'text-status-critical';
  }
}

export function statusBgClass(status: Status): string {
  switch (status) {
    case 'normal':
      return 'bg-status-normal/10 border-status-normal/30';
    case 'caution':
      return 'bg-status-caution/10 border-status-caution/30';
    case 'critical':
      return 'bg-status-critical/10 border-status-critical/30';
  }
}
