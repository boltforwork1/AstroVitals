import type { Alert } from '@/types/alerts';
import type { DailyRecord, IndicatorKey } from '@/types/health';
import { crewMember } from '@/data/mockRecords';
import { indicators } from '@/data/indicators';
import { calculateHealthScore, getScoreLabel } from './score';
import { getTrend } from './trend';
import { ALERT_LEVEL_LABEL } from './alerts';

const INDICATOR_KEYS = Object.keys(indicators) as IndicatorKey[];
const DAY_COLUMN_WIDTH = 12;

const labelOf = (key: IndicatorKey) => `${indicators[key].label} (${indicators[key].unit})`;

export function buildSurgeonReport(records: DailyRecord[], alerts: Alert[]): string {
  const latest = records[records.length - 1];
  const lastDays = records.slice(-3);
  const score = calculateHealthScore(latest);
  const labelWidth = Math.max(...INDICATOR_KEYS.map((k) => labelOf(k).length)) + 2;
  const lines: string[] = [];

  lines.push('ASTROVITALS - FLIGHT SURGEON REPORT', '');
  lines.push(`Crew member:   ${crewMember.name} (${crewMember.role})`);
  lines.push(`Mission day:   ${latest.missionDay} of ${crewMember.missionLength}`);
  lines.push(`Date:          ${latest.date}`);
  lines.push(`Health score:  ${score} / 100 (${getScoreLabel(score).label})`, '');

  lines.push('LAST 3 DAYS');
  lines.push(
    'Indicator'.padEnd(labelWidth) +
      lastDays.map((r) => `Day ${r.missionDay}`.padEnd(DAY_COLUMN_WIDTH)).join('')
  );
  INDICATOR_KEYS.forEach((k) => {
    lines.push(
      labelOf(k).padEnd(labelWidth) +
        lastDays.map((r) => String(r[k]).padEnd(DAY_COLUMN_WIDTH)).join('')
    );
  });

  lines.push('', 'ACTIVE ALERTS');
  const active = alerts.filter((a) => a.level !== 'info');
  if (active.length === 0) lines.push('None.');
  active.forEach((a) => {
    lines.push(`[${ALERT_LEVEL_LABEL[a.level].toUpperCase()}] ${a.title}`);
    lines.push(`  ${a.message}`);
    a.actions.forEach((action) => lines.push(`  - ${action}`));
    if (a.escalate) lines.push('  Flagged for flight surgeon contact.');
  });

  lines.push('', 'TRENDS (last 3 days vs previous 7)');
  INDICATOR_KEYS.forEach((k) => {
    const trend = getTrend(records, k);
    const summary =
      trend.direction === 'flat' ? 'flat (within 1.5%)' : `${trend.direction} ${trend.percent}%`;
    lines.push(`${labelOf(k).padEnd(labelWidth)}${summary}`);
  });

  lines.push('', 'Decision-support only. Not a medical diagnosis. Follow mission medical protocols.');
  return lines.join('\n');
}
