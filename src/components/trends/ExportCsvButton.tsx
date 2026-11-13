import { Download } from 'lucide-react';
import { exportRecordsCsv } from '@/utils/stats';
import type { DailyRecord } from '@/types/health';

interface ExportCsvButtonProps {
  records: DailyRecord[];
}

export default function ExportCsvButton({ records }: ExportCsvButtonProps) {
  return (
    <button
      onClick={() => exportRecordsCsv(records)}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-space-muted border border-space-border bg-space-surface hover:text-space-text hover:border-space-muted/50 transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      Export CSV
    </button>
  );
}
