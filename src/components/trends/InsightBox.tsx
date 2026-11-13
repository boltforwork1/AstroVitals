import { motion } from 'framer-motion';
import { Activity, TriangleAlert as AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import type { TrendMetric } from '@/utils/stats';
import { METRIC_LABEL, countOutOfRange, getStats, metricStatus } from '@/utils/stats';

interface InsightBoxProps {
  metric: TrendMetric;
  series: { missionDay: number; value: number }[];
}

export default function InsightBox({ metric, series }: InsightBoxProps) {
  const { count, streak } = countOutOfRange(series, metric);
  const { percentChange } = getStats(series);

  const name = METRIC_LABEL[metric];
  const pct = Math.round(Math.abs(percentChange));
  const direction = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'flat';

  let sentence: string;
  if (count === 0) {
    sentence = `${name} has stayed in the normal range for the whole period.`;
  } else if (streak > 0) {
    sentence = `${name} has been out of its normal range for ${streak} day${streak === 1 ? '' : 's'} in a row`;
    sentence +=
      pct >= 1
        ? ` and is ${direction === 'up' ? 'up' : 'down'} ${pct}% over this period.`
        : '.';
  } else if (direction !== 'flat' && pct >= 1) {
    sentence = `${name} drifted ${direction === 'up' ? 'up' : 'down'} ${pct}% over this period, with ${count} day${count === 1 ? '' : 's'} outside the normal range.`;
  } else {
    sentence = `${name} was outside the normal range on ${count} day${count === 1 ? '' : 's'} this period, but has settled back in range.`;
  }

  const latest = series[series.length - 1]?.value ?? 0;
  const currentStatus = metricStatus(metric, latest);
  const isCritical = currentStatus === 'critical';

  const icon = isCritical ? (
    <AlertTriangle className="w-4 h-4 text-status-critical" />
  ) : count > 0 ? (
    <AlertTriangle className="w-4 h-4 text-status-caution" />
  ) : (
    <Activity className="w-4 h-4 text-status-normal" />
  );

  return (
    <motion.div
      key={`${metric}-${series.length}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 p-4 rounded-xl bg-space-surface border border-space-border"
    >
      <span className="shrink-0 mt-0.5">{icon}</span>
      <p className="text-sm text-space-text leading-relaxed flex-1">{sentence}</p>
      {direction !== 'flat' && pct > 0 && (
        <span
          className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium ${
            percentChange > 0 ? 'text-status-caution' : 'text-status-normal'
          }`}
        >
          {percentChange > 0 ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          {pct}%
        </span>
      )}
    </motion.div>
  );
}
