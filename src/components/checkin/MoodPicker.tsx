import { motion } from 'framer-motion';
import { useRef } from 'react';
import type { Status } from '@/types/health';
import { statusColor } from '@/utils/status';
import { MoodIcon, getMoodLabel } from '@/components/ui/MoodIcon';

const MOOD_VALUES = [1, 2, 3, 4, 5];

interface MoodPickerProps {
  value: number;
  status: Status;
  onChange: (value: number) => void;
}

export default function MoodPicker({ value, status, onChange }: MoodPickerProps) {
  const color = statusColor(status);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusMood = (index: number) => {
    const clamped = ((index % MOOD_VALUES.length) + MOOD_VALUES.length) % MOOD_VALUES.length;
    const btn = buttonRefs.current[clamped];
    if (btn) btn.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentValue: number) => {
    const currentIndex = MOOD_VALUES.indexOf(currentValue);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex + 1;
      if (nextIndex < MOOD_VALUES.length) {
        onChange(MOOD_VALUES[nextIndex]);
        focusMood(nextIndex);
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        onChange(MOOD_VALUES[prevIndex]);
        focusMood(prevIndex);
      }
    }
  };

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
        {MOOD_VALUES.map((moodValue, i) => {
          const selected = value === moodValue;
          return (
            <button
              key={moodValue}
              ref={(el) => { buttonRefs.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(moodValue)}
              onKeyDown={(e) => handleKeyDown(e, moodValue)}
              className={`flex flex-col items-center gap-1.5 px-1 py-3 rounded-xl border transition-all duration-200 ${
                selected
                  ? 'border-accent/60 bg-accent/10'
                  : 'border-space-border bg-space-bg/40 hover:border-space-muted/50'
              }`}
            >
              <motion.div
                animate={selected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <MoodIcon
                  level={moodValue}
                  size="md"
                  showRing={false}
                  selected={selected}
                />
              </motion.div>
              <span
                className={`text-[10px] font-medium ${selected ? 'text-accent' : 'text-space-muted'}`}
              >
                {getMoodLabel(moodValue)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
