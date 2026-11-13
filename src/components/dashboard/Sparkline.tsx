import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DailyRecord, IndicatorKey } from '@/types/health';

interface SparklineProps {
  records: DailyRecord[];
  dataKey: IndicatorKey;
  color: string;
}

export default function Sparkline({ records, dataKey, color }: SparklineProps) {
  const data = records.slice(-14).map((r) => r[dataKey]);
  const width = 100;
  const height = 32;

  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return { x, y };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const gradientId = `spark-${dataKey}`;

  return (
    <svg width={width} height={height} className="w-full h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.path
        d={areaD}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

export function TrendArrow({ direction, percent }: { direction: 'up' | 'down' | 'flat'; percent: number }) {
  if (direction === 'flat') {
    return (
      <span className="inline-flex items-center gap-0.5 text-space-muted text-xs font-medium">
        <Minus className="w-3 h-3" />
        <span>flat</span>
      </span>
    );
  }

  const isUp = direction === 'up';
  const colorClass = isUp ? 'text-status-caution' : 'text-status-normal';

  return (
    <span className={`inline-flex items-center gap-0.5 ${colorClass} text-xs font-medium`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span>{percent}%</span>
    </span>
  );
}
