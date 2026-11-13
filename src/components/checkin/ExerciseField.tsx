import { RotateCcw } from 'lucide-react';
import type { Status } from '@/types/health';
import { statusColor } from '@/utils/status';

const STATUS_LABEL: Record<Status, string> = {
  normal: 'Normal',
  caution: 'Caution',
  critical: 'Critical',
};

const CHIPS = [
  { label: '+15', amount: 15 },
  { label: '+30', amount: 30 },
  { label: '+60', amount: 60 },
];

interface ExerciseFieldProps {
  id: string;
  value: string;
  error: string | null;
  status: Status;
  onChange: (value: string) => void;
}

export default function ExerciseField({ id, value, error, status, onChange }: ExerciseFieldProps) {
  const color = statusColor(status);
  const numeric = Number(value);

  const add = (amount: number) => {
    const current = Number.isFinite(numeric) && value !== '' ? numeric : 0;
    onChange(String(current + amount));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-space-text">
          Exercise minutes today
        </label>
        {error ? (
          <span className="text-xs font-medium text-status-critical">{error}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
            />
            {STATUS_LABEL[status]}
          </span>
        )}
      </div>

      <div
        className="relative rounded-xl border bg-space-bg/60 transition-colors duration-200 focus-within:border-accent/50"
        style={{ borderColor: error ? 'var(--color-critical)' : 'var(--color-border)' }}
      >
        <input
          id={id}
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          className="w-full h-14 rounded-xl bg-transparent pl-4 pr-16 text-lg font-semibold text-space-text tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="—"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-space-muted pointer-events-none">
          min
        </span>
      </div>

      {error && <p className="text-xs text-status-critical">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => add(chip.amount)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent/10 border border-accent/25 text-accent hover:bg-accent/20 transition-colors"
          >
            {chip.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange('0')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-space-bg/40 border border-space-border text-space-muted hover:text-space-text hover:border-space-muted/50 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>
    </div>
  );
}
