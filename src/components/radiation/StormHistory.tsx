import { useStorm } from '@/context/StormContext';
import { STORM_LEVELS } from '@/data/radiationConfig';
import { statusColor } from '@/utils/status';

export default function StormHistory() {
  const { history } = useStorm();
  const rows = [...history].reverse();

  return (
    <div className="border-t border-space-border pt-5">
      <h3 className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-3">Storm history</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-space-muted">
          No solar storms simulated yet. Run one above to see how sheltering changes your dose.
        </p>
      ) : (
        <ul className="divide-y divide-space-border rounded-lg border border-space-border overflow-hidden">
          {rows.map((e) => {
            const color = statusColor(STORM_LEVELS[e.level].status);
            return (
              <li key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  {e.level} · {STORM_LEVELS[e.level].label}
                </span>
                <span className="text-space-text">Day {e.missionDay}</span>
                <span className="text-space-text tabular-nums">+{e.extraDose.toFixed(2)} mSv</span>
                <span className={`text-xs ${e.sheltered ? 'text-status-normal' : 'text-space-muted'}`}>
                  Sheltered: {e.sheltered ? 'yes' : 'no'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
