import { useStorm } from '@/context/StormContext';

export default function StormPhaseActions() {
  const { skipToRecovery, cancelStorm } = useStorm();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
      <button
        type="button"
        onClick={skipToRecovery}
        className="px-2 py-1 text-xs font-medium text-space-muted underline underline-offset-4 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        Skip to end
      </button>
      <button
        type="button"
        onClick={cancelStorm}
        className="px-3 py-1.5 rounded-lg text-xs font-medium text-space-muted border border-space-border hover:text-space-text hover:border-space-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Cancel
      </button>
    </div>
  );
}
