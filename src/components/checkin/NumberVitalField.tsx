import { useState } from 'react';
import { ChevronDown, Image } from 'lucide-react';
import type { Status } from '@/types/health';
import { statusColor } from '@/utils/status';
import MeasureImageModal from '@/components/ui/MeasureImageModal';
import { getMeasureGuide } from '@/data/measureGuides';

const STATUS_LABEL: Record<Status, string> = {
  normal: 'Normal',
  caution: 'Caution',
  critical: 'Critical',
};

interface NumberVitalFieldProps {
  id: string;
  label: string;
  unit: string;
  value: string;
  step?: string;
  error: string | null;
  status: Status | null;
  measure: string;
  guideKey?: string;
  onChange: (value: string) => void;
}

export default function NumberVitalField({
  id,
  label,
  unit,
  value,
  step = '1',
  error,
  status,
  measure,
  guideKey,
  onChange,
}: NumberVitalFieldProps) {
  const [showMeasure, setShowMeasure] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const color = status && !error ? statusColor(status) : null;
  const guide = guideKey ? getMeasureGuide(guideKey) : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-space-text">
          {label}
        </label>
        {error ? (
          <span className="text-xs font-medium text-status-critical">{error}</span>
        ) : status ? (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium"
            style={{ color: statusColor(status) }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColor(status), boxShadow: `0 0 6px ${statusColor(status)}80` }}
            />
            {STATUS_LABEL[status]}
          </span>
        ) : null}
      </div>

      <div
        className="relative rounded-xl border bg-space-bg/60 transition-colors duration-200 focus-within:border-accent/50"
        style={{ borderColor: error ? 'var(--color-critical)' : color ? `${color}55` : 'var(--color-border)' }}
      >
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full h-14 rounded-xl bg-transparent pl-4 pr-16 text-lg font-semibold text-space-text tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="—"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-space-muted pointer-events-none">
          {unit}
        </span>
      </div>

      {error && (
        <p id={`${id}-error`} className="text-xs text-status-critical">
          {error}
        </p>
      )}

      {guide ? (
        <>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 self-start text-[11px] text-space-muted hover:text-accent transition-colors"
          >
            <Image className="w-3 h-3" />
            How to measure
          </button>
          <MeasureImageModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            guide={guide}
            fallbackText={measure}
          />
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setShowMeasure((s) => !s)}
            aria-expanded={showMeasure}
            className="flex items-center gap-1 self-start text-[11px] text-space-muted hover:text-accent transition-colors"
          >
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${showMeasure ? 'rotate-180' : ''}`}
            />
            How to measure
          </button>
          {showMeasure && (
            <p className="text-xs text-space-muted leading-relaxed bg-space-bg/40 border border-space-border rounded-lg p-2.5">
              {measure}
            </p>
          )}
        </>
      )}
    </div>
  );
}
