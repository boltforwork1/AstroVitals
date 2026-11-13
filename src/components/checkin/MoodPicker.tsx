import { motion } from 'framer-motion';
import type { Status } from '@/types/health';
import { statusColor } from '@/utils/status';

const MOODS: { value: number; label: string; face: string }[] = [
  { value: 1, label: 'Very low', face: 'M16 28c3-4 5-6 8-6s5 2 8 6' },
  { value: 2, label: 'Low', face: 'M15 27c2.5-3 4.5-4 9-4s6.5 1 9 4' },
  { value: 3, label: 'Okay', face: 'M15 26c3 2 5 2 9 0 1-.6 2-1 3 0' },
  { value: 4, label: 'Good', face: 'M15 25c2.5 3 4.5 4 9 4s6.5-1 9-4' },
  { value: 5, label: 'Very good', face: 'M14 24c3 4 5 6 10 6s7-2 10-6' },
];

interface MoodPickerProps {
  value: number;
  status: Status;
  onChange: (value: number) => void;
}

export default function MoodPicker({ value, status, onChange }: MoodPickerProps) {
  const color = statusColor(status);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-space-text" id="mood-label">
          How do you feel today?
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
          />
          {status === 'normal' ? 'Normal' : status === 'caution' ? 'Caution' : 'Critical'}
          <span className="text-space-muted ml-1">({value.toFixed(1)}/5)</span>
        </span>
      </div>

      <div role="radiogroup" aria-labelledby="mood-label" className="grid grid-cols-5 gap-2">
        {MOODS.map((m) => {
          const selected = value === m.value;
          return (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(m.value)}
              className={`flex flex-col items-center gap-1.5 px-1 py-3 rounded-xl border transition-all duration-200 ${
                selected
                  ? 'border-accent/60 bg-accent/10'
                  : 'border-space-border bg-space-bg/40 hover:border-space-muted/50'
              }`}
            >
              <motion.svg
                viewBox="0 0 48 48"
                className="w-9 h-9"
                animate={selected ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill={selected ? 'rgba(34, 211, 238, 0.12)' : 'rgba(28, 39, 64, 0.5)'}
                  stroke={selected ? 'var(--color-accent)' : 'var(--color-border)'}
                  strokeWidth="2"
                />
                {/* eyes */}
                <circle cx="17" cy="19" r="2.2" fill={selected ? 'var(--color-accent)' : 'var(--color-muted)'} />
                <circle cx="31" cy="19" r="2.2" fill={selected ? 'var(--color-accent)' : 'var(--color-muted)'} />
                {/* mouth */}
                <path
                  d={m.face}
                  fill="none"
                  stroke={selected ? 'var(--color-accent)' : 'var(--color-muted)'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </motion.svg>
              <span
                className={`text-[10px] font-medium ${selected ? 'text-accent' : 'text-space-muted'}`}
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
