import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DailyRecord, IndicatorKey, Status } from '@/types/health';
import { indicators } from '@/data/indicators';
import { getStatus, statusColor } from '@/utils/status';
import { getTrend } from '@/utils/trend';
import Sparkline, { TrendArrow } from './Sparkline';

interface IndicatorCardProps {
  indicatorKey: IndicatorKey;
  todayRecord: DailyRecord;
  records: DailyRecord[];
  index: number;
  onClick: (key: IndicatorKey) => void;
}

const STATUS_LABEL: Record<Status, string> = {
  normal: 'Normal',
  caution: 'Caution',
  critical: 'Critical',
};

export default function IndicatorCard({
  indicatorKey,
  todayRecord,
  records,
  index,
  onClick,
}: IndicatorCardProps) {
  const ind = indicators[indicatorKey];
  const value = todayRecord[indicatorKey];
  const status = getStatus(indicatorKey, value);
  const color = statusColor(status);
  const trend = getTrend(records, indicatorKey);

  const IconComp = (Icons as unknown as Record<string, LucideIcon>)[ind.icon] || Icons.Activity;

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      onClick={() => onClick(indicatorKey)}
      className="relative flex flex-col bg-space-surface border border-space-border rounded-xl p-4 text-left transition-all duration-200 hover:border-space-muted/40 overflow-hidden group"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 30px ${color}10` }}
      />

      <div className="flex items-center justify-between mb-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <IconComp className="w-[18px] h-[18px]" style={{ color }} />
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      <p className="text-xs text-space-muted mb-1">{ind.label}</p>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-space-text tabular-nums">{value}</span>
        <span className="text-xs text-space-muted">{ind.unit}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <TrendArrow direction={trend.direction} percent={trend.percent} />
        <div className="flex-1 max-w-[100px]">
          <Sparkline records={records} dataKey={indicatorKey} color={color} />
        </div>
      </div>
    </motion.button>
  );
}
