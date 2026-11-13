import { motion } from 'framer-motion';
import { CAREER_LIMIT_LABEL, CAREER_LIMIT_MSV, doseZoneFor } from '@/data/radiationConfig';
import { statusColor } from '@/utils/status';

const ARC = 'M 10 100 A 90 90 0 0 1 190 100';

interface DoseGaugeProps {
  cumulative: number;
}

export default function DoseGauge({ cumulative }: DoseGaugeProps) {
  const percent = (cumulative / CAREER_LIMIT_MSV) * 100;
  const zone = doseZoneFor(percent);
  const color = statusColor(zone.status);
  const fraction = Math.min(1, Math.max(0, percent / 100));

  return (
    <section
      aria-labelledby="dose-gauge-title"
      className="h-full bg-space-surface border border-space-border rounded-xl p-5 sm:p-6 flex flex-col items-center"
    >
      <h2
        id="dose-gauge-title"
        className="self-start text-sm font-semibold text-space-muted uppercase tracking-wider"
      >
        Cumulative dose
      </h2>

      <div
        className="relative w-full max-w-[280px] mt-4"
        role="img"
        aria-label={`Cumulative dose ${cumulative.toFixed(1)} mSv, ${percent.toFixed(1)} percent of the career limit`}
      >
        <svg viewBox="0 0 200 110" className="w-full h-auto overflow-visible">
          <path d={ARC} fill="none" stroke="var(--color-border)" strokeWidth="14" strokeLinecap="round" />
          <motion.path
            d={ARC}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: fraction }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-4xl font-bold text-space-text tabular-nums">{cumulative.toFixed(1)}</span>
          <span className="text-xs text-space-muted">mSv</span>
        </div>
      </div>

      <div className="flex justify-between w-full max-w-[280px] text-[11px] text-space-muted tabular-nums mt-1">
        <span>0</span>
        <span>{CAREER_LIMIT_MSV} mSv</span>
      </div>

      <div className="mt-auto pt-6 text-center">
        <p className="text-2xl font-semibold tabular-nums" style={{ color }}>
          {percent.toFixed(1)}% of limit
        </p>
        <p className="text-xs text-space-muted mt-1">{CAREER_LIMIT_LABEL}</p>
        <span
          className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          {zone.label}
        </span>
      </div>
    </section>
  );
}
