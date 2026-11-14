import type { DailyRecord, IndicatorKey } from '@/types/health';
import type { AlertState } from '@/types/alerts';
import { indicators } from '@/data/indicators';
import { calculateHealthScore, getScoreLabel } from './score';
import { getStatus } from './status';
import { getTrend } from './trend';
import { ALERT_LEVEL_RANK } from './alerts';

// Only simulated demo data is sent; never send real personal medical data.
const MAX_ALERTS = 5;

const TREND_ARROW: Record<string, string> = { up: 'up', down: 'down', flat: 'stable' };

export function buildAssistantContext(records: DailyRecord[], alerts: AlertState[]): string {
  const latest = records[records.length - 1];
  const score = calculateHealthScore(latest);
  const { label } = getScoreLabel(score);

  const lines: string[] = [];
  lines.push(`Mission day: ${latest.missionDay}`);
  lines.push(`Health score: ${score}/100 (${label})`);
  lines.push('');

  const indicatorLines = (Object.keys(indicators) as IndicatorKey[]).map((key) => {
    const ind = indicators[key];
    const value = latest[key];
    const status = getStatus(key, value);
    const trend = getTrend(records, key);
    const trendStr = TREND_ARROW[trend.direction] ?? 'stable';
    return `${ind.label}: ${value}${ind.unit} [${status}] trend ${trendStr}`;
  });
  lines.push('Current indicators:');
  lines.push(...indicatorLines);
  lines.push('');

  const sorted = [...alerts].sort(
    (a, b) => ALERT_LEVEL_RANK[b.level] - ALERT_LEVEL_RANK[a.level]
  );
  const topAlerts = sorted.slice(0, MAX_ALERTS);

  if (topAlerts.length > 0) {
    lines.push('Active alerts:');
    topAlerts.forEach((a) => lines.push(`- [${a.level}] ${a.title}`));
  } else {
    lines.push('Active alerts: none');
  }

  return lines.join('\n').slice(0, 1500);
}
