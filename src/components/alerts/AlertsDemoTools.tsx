import { useState } from 'react';
import { FlaskConical, TrendingDown, Trash2 } from 'lucide-react';
import { useRecords } from '@/context/RecordsContext';
import { ConfirmDialog } from '@/components/checkin/DemoTools';
import { buildStressScenario } from '@/utils/stressScenario';

export default function AlertsDemoTools() {
  const { records, addRecord, resetToDemo } = useRecords();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const injectStress = () => {
    buildStressScenario(records[records.length - 1]).forEach((record) => addRecord(record));
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 rounded-xl border border-dashed border-space-border/70 bg-space-bg/30">
        <div className="flex items-center gap-2 text-xs text-space-muted">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Demo tools</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={injectStress}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-space-muted border border-space-border hover:text-status-caution hover:border-status-caution/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <TrendingDown className="w-3 h-3" />
            Inject stress scenario
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-space-muted border border-space-border hover:text-status-critical hover:border-status-critical/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Trash2 className="w-3 h-3" />
            Reset demo data
          </button>
        </div>
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
