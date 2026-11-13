import { useState } from 'react';
import { FlaskConical, Trash2 } from 'lucide-react';
import { useRecords } from '@/context/RecordsContext';

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, description, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-space-surface border border-space-border rounded-xl p-5 shadow-2xl">
        <h2 className="text-base font-semibold text-space-text mb-1.5">{title}</h2>
        <p className="text-sm text-space-muted leading-relaxed mb-5">{description}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-space-muted border border-space-border hover:text-space-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-status-critical text-white hover:bg-status-critical/85 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DemoTools() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { resetToDemo } = useRecords();

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-dashed border-space-border/70 bg-space-bg/30">
        <div className="flex items-center gap-2 text-xs text-space-muted">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Demo tools</span>
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-space-muted border border-space-border hover:text-status-critical hover:border-status-critical/40 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Reset demo data
        </button>
      </div>

      {confirmOpen && (
        <ConfirmDialog
          title="Reset demo data?"
          description="All saved check-ins will be removed and the app will go back to the built-in demo mission data."
          confirmLabel="Reset"
          onConfirm={() => {
            setConfirmOpen(false);
            resetToDemo();
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  );
}
