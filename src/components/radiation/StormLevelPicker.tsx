import { Zap } from 'lucide-react';
import { STORM_LEVELS, STORM_LEVEL_ORDER, type StormLevel } from '@/data/radiationConfig';
import { statusColor } from '@/utils/status';

interface StormLevelPickerProps {
  level: StormLevel;
  onChange: (level: StormLevel) => void;
  onStart: () => void;
}

export default function StormLevelPicker({ level, onChange, onStart }: StormLevelPickerProps) {
  const info = STORM_LEVELS[level];
  const color = statusColor(info.status);

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Storm level" className="grid grid-cols-5 gap-2">
        {STORM_LEVEL_ORDER.map((l) => {
          const selected = l === level;
          return (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(l)}
              className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                selected
                  ? 'border-accent/60 bg-accent/10 text-accent'
                  : 'border-space-border bg-space-bg/40 text-space-muted hover:text-space-text hover:border-space-muted/50'
              }`}
            >
              <span className="text-sm font-semibold">{l}</span>
              <span className="text-[10px]">{STORM_LEVELS[l].label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-space-border bg-space-bg/40 p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color }}>
            {level} · {info.label}
          </p>
          <p className="text-xs text-space-muted leading-relaxed mt-1">{info.description}</p>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-space-bg text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_var(--color-accent-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Zap className="w-4 h-4" />
          Simulate solar storm
        </button>
      </div>
    </div>
  );
}
