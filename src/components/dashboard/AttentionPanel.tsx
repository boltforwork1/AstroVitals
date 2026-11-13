import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { DailyRecord, IndicatorKey } from '@/types/health';
import { indicators } from '@/data/indicators';
import { getStatus, statusColor } from '@/utils/status';

interface AttentionItem {
  key: IndicatorKey;
  label: string;
  value: number;
  unit: string;
  status: 'caution' | 'critical';
  message: string;
}

interface AttentionPanelProps {
  todayRecord: DailyRecord;
  records: DailyRecord[];
}

function buildMessage(key: IndicatorKey, records: DailyRecord[], value: number): string {
  const ind = indicators[key];

  if (value < ind.normalRange.min) {
    const count = records
      .slice(-14)
      .filter((r) => r[key] < ind.normalRange.min).length;
    if (key === 'sleep') return `Sleep below target for ${count} of last 14 days`;
    if (key === 'mood') return `Mood below target for ${count} of last 14 days`;
    if (key === 'exercise') return `Exercise below target for ${count} of last 14 days`;
    return `${ind.label} below target for ${count} of last 14 days`;
  }

  if (value > ind.normalRange.max) {
    const count = records
      .slice(-14)
      .filter((r) => r[key] > ind.normalRange.max).length;
    return `${ind.label} above target for ${count} of last 14 days`;
  }

  return ind.description;
}

export default function AttentionPanel({ todayRecord, records }: AttentionPanelProps) {
  const keys = Object.keys(indicators) as IndicatorKey[];
  const items: AttentionItem[] = keys
    .map((key) => {
      const value = todayRecord[key];
      const status = getStatus(key, value);
      if (status === 'normal') return null;
      return {
        key,
        label: indicators[key].label,
        value,
        unit: indicators[key].unit,
        status,
        message: buildMessage(key, records, value),
      };
    })
    .filter((item): item is AttentionItem => item !== null)
    .sort((a, b) => (a.status === 'critical' ? -1 : 1));

  return (
    <div className="bg-space-surface border border-space-border rounded-xl p-6 h-full">
      <h2 className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-4">
        Needs Attention
      </h2>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-status-normal/10 border border-status-normal/30 mb-3">
            <CheckCircle2 className="w-7 h-7 text-status-normal" />
          </div>
          <p className="text-sm font-medium text-status-normal">All indicators in range</p>
          <p className="text-xs text-space-muted mt-1">No action needed today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => {
            const color = statusColor(item.status);
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08, ease: 'easeOut' }}
                className="flex items-start gap-3 p-3 rounded-lg bg-space-bg/40 border border-space-border"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-space-text">{item.label}</span>
                    <span className="text-xs text-space-muted tabular-nums">
                      {item.value}{item.unit}
                    </span>
                    {item.status === 'critical' && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-status-critical bg-status-critical/10 px-1.5 py-0.5 rounded">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Critical
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-space-muted mt-0.5">{item.message}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
