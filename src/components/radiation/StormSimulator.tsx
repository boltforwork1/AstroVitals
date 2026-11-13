import { useState } from 'react';
import { Sun } from 'lucide-react';
import { useStorm } from '@/context/StormContext';
import type { StormLevel } from '@/data/radiationConfig';
import { STORM_LEVELS } from '@/data/radiationConfig';
import { statusColor } from '@/utils/status';
import StormLevelPicker from './StormLevelPicker';
import StormWarningPhase from './StormWarningPhase';
import StormShelterPhase from './StormShelterPhase';
import StormRecoveryPhase from './StormRecoveryPhase';
import StormHistory from './StormHistory';

export default function StormSimulator() {
  const { activeStorm, startStorm } = useStorm();
  const [level, setLevel] = useState<StormLevel>('S2');
  const active = activeStorm !== null;
  const pillColor = statusColor(active ? 'critical' : 'normal');

  return (
    <section
      aria-labelledby="space-weather-title"
      className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-status-caution/10 border border-status-caution/30 shrink-0">
            <Sun className="w-5 h-5 text-status-caution" />
          </div>
          <div>
            <h2 id="space-weather-title" className="text-base font-semibold text-space-text">
              Space weather
            </h2>
            <p className="text-xs text-space-muted">Simulate a solar particle event and practice sheltering</p>
          </div>
        </div>
        <span
          role="status"
          className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: `${pillColor}15`, color: pillColor, border: `1px solid ${pillColor}40` }}
        >
          <span
            className={`w-2 h-2 rounded-full ${active ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: pillColor }}
          />
          {active ? 'Storm active' : 'Quiet'}
        </span>
      </div>

      {activeStorm === null ? (
        <div className="space-y-3">
          <StormLevelPicker level={level} onChange={setLevel} onStart={() => startStorm(level)} />
          <p className="text-xs text-space-muted">
            Level {level} ({STORM_LEVELS[level].label}) adds up to {STORM_LEVELS[level].extraDoseMsv} mSv if the crew
            does not shelter.
          </p>
        </div>
      ) : (
        <>
          {activeStorm.phase === 'warning' && <StormWarningPhase storm={activeStorm} />}
          {activeStorm.phase === 'shelter' && <StormShelterPhase storm={activeStorm} />}
          {activeStorm.phase === 'recovery' && <StormRecoveryPhase storm={activeStorm} />}
        </>
      )}

      <StormHistory />
    </section>
  );
}
