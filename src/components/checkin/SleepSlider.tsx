import { Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Status } from '@/types/health';
import { statusColor } from '@/utils/status';

const STATUS_LABEL: Record<Status, string> = {
  normal: 'Normal',
  caution: 'Caution',
  critical: 'Critical',
};

interface SleepSliderProps {
  value: number;
  status: Status;
  onChange: (value: number) => void;
}

export default function SleepSlider({ value, status, onChange }: SleepSliderProps) {
  const color = statusColor(status);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label htmlFor="sleep-slider" className="text-sm font-medium text-space-text">
          Hours of sleep
        </label>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
          />
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <motion.span
          key={value}
          initial={{ scale: 0.9, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="text-4xl font-bold text-space-text tabular-nums"
        >
          {value.toFixed(1)}
        </motion.span>
        <span className="text-sm text-space-muted">hours</span>
      </div>

      <input
        id="sleep-slider"
        type="range"
        min={0}
        max={12}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-accent w-full"
        aria-valuetext={`${value.toFixed(1)} hours`}
      />

      <div className="flex items-center justify-between text-[11px] text-space-muted">
        <span className="flex items-center gap-1">
          <Moon className="w-3 h-3" />0 h
        </span>
        <span>12 h</span>
      </div>
    </div>
  );
}
