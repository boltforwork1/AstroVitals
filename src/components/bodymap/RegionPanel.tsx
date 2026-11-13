import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  ArrowRight,
  Activity,
} from 'lucide-react';
import type { DailyRecord } from '@/types/health';
import type { RegionId } from '@/data/bodyRegions';
import { regionMap } from '@/data/bodyRegions';
import { hazards } from '@/data/hazards';
import { indicators } from '@/data/indicators';
import { getRegionStatus } from '@/utils/regionStatus';
import { getTrend } from '@/utils/trend';
import { statusColor } from '@/utils/status';

interface RegionPanelProps {
  regionId: RegionId | null;
  record: DailyRecord;
  records: DailyRecord[];
  onNavigate?: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  normal: 'Normal',
  caution: 'Caution',
  critical: 'Critical',
};

export default function RegionPanel({ regionId, record, records, onNavigate }: RegionPanelProps) {
  const navigate = useNavigate();

  return (
    <div className="h-full">
      <AnimatePresence mode="wait">
        {regionId ? (
          <PanelContent
            key={regionId}
            regionId={regionId}
            record={record}
            records={records}
            onTrendsClick={() => {
              onNavigate?.();
              navigate('/trends');
            }}
          />
        ) : (
          <EmptyState key="empty" />
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-full text-center py-16 px-6"
    >
      <div className="relative mb-6">
        <motion.div
          className="absolute inset-0 bg-accent/10 rounded-full blur-xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-space-surface border border-accent/20">
          <Activity className="w-7 h-7 text-accent" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-space-text mb-1.5">
        Explore Your Body
      </h3>
      <p className="text-sm text-space-muted max-w-xs">
        Tap any part of the body to see its health status, related vitals, and what to watch for in space.
      </p>
      <motion.div
        className="mt-6 flex items-center gap-2 text-xs text-accent"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="w-8 h-px bg-accent/40" />
        <span>Select a region</span>
        <span className="w-8 h-px bg-accent/40" />
      </motion.div>
    </motion.div>
  );
}

function PanelContent({
  regionId,
  record,
  records,
  onTrendsClick,
}: {
  regionId: RegionId;
  record: DailyRecord;
  records: DailyRecord[];
  onTrendsClick: () => void;
}) {
  const region = regionMap[regionId];
  const result = getRegionStatus(regionId, record);
  const color = statusColor(result.status);
  const regionHazards = hazards.filter((h) => region.hazards.includes(h.id));

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (result.score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-full overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-5 border-b border-space-border">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="6" />
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeOffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-space-text tabular-nums">{result.score}</span>
          </div>
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-space-text">{region.name}</h2>
          <div
            className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${color}15`, color }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            {STATUS_LABEL[result.status]}
          </div>
        </div>
      </div>

      {/* Hazard tags */}
      <div className="px-5 py-3 border-b border-space-border">
        <p className="text-[10px] text-space-muted uppercase tracking-wider mb-2">Hazards</p>
        <div className="flex flex-wrap gap-1.5">
          {regionHazards.map((h) => (
            <span
              key={h.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
              style={{ backgroundColor: `${h.color}15`, color: h.color }}
            >
              {h.label}
            </span>
          ))}
        </div>
      </div>

      {/* Related indicators */}
      <div className="px-5 py-4 border-b border-space-border">
        <p className="text-[10px] text-space-muted uppercase tracking-wider mb-3">Related Vitals</p>
        <div className="space-y-2.5">
          {result.indicators.map((ind) => {
            const indConfig = indicators[ind.key];
            const indColor = statusColor(ind.status);
            const trend = getTrend(records, ind.key);
            return (
              <div key={ind.key} className="flex items-center gap-3">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: indColor, boxShadow: `0 0 4px ${indColor}80` }}
                />
                <span className="text-sm text-space-text flex-1">{indConfig.label}</span>
                <span className="text-sm text-space-muted tabular-nums">
                  {ind.value}<span className="text-xs ml-0.5">{indConfig.unit}</span>
                </span>
                <TrendIcon direction={trend.direction} percent={trend.percent} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Text sections */}
      <div className="p-5 space-y-5">
        <Section title="What it does" text={region.function} />
        <Section title="How space affects it" text={region.spaceEffect} />

        <div>
          <h3 className="text-sm font-semibold text-space-text mb-1.5">Warning Signs</h3>
          <p className="text-sm text-space-muted leading-relaxed">{region.warningSigns}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-space-text mb-2">What You Can Do</h3>
          <ul className="space-y-2">
            {region.whatToDo.map((tip, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-status-normal shrink-0 mt-0.5" />
                <span className="text-sm text-space-muted leading-relaxed">{tip}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer button */}
      <div className="p-5 pt-0">
        <button
          onClick={onTrendsClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm font-medium transition-all duration-200 hover:bg-accent/20 hover:shadow-[0_0_20px_var(--color-accent-glow)]"
        >
          View Trends
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-space-text mb-1.5">{title}</h3>
      <p className="text-sm text-space-muted leading-relaxed">{text}</p>
    </div>
  );
}

function TrendIcon({ direction, percent }: { direction: 'up' | 'down' | 'flat'; percent: number }) {
  if (direction === 'flat') {
    return (
      <span className="inline-flex items-center gap-0.5 text-space-muted text-xs">
        <Minus className="w-3 h-3" />
      </span>
    );
  }
  const isUp = direction === 'up';
  const colorClass = isUp ? 'text-status-caution' : 'text-status-normal';
  return (
    <span className={`inline-flex items-center gap-0.5 ${colorClass} text-xs`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span>{percent}%</span>
    </span>
  );
}
