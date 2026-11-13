import { useEffect, useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Check } from 'lucide-react';
import { useStorm, type ActiveStorm } from '@/context/StormContext';
import { SHELTER_CHECKLIST, SHELTER_DURATION_MS, STORM_LEVELS } from '@/data/radiationConfig';
import { useNow } from '@/hooks/useNow';
import { ambientStormRate, stormUnprotectedDose } from '@/utils/radiation';
import { statusColor } from '@/utils/status';
import StormPhaseActions from './StormPhaseActions';

const CHART_STEPS = 24;
const RATE_COLOR = '#F97316';

interface StormShelterPhaseProps {
  storm: ActiveStorm;
}

export default function StormShelterPhase({ storm }: StormShelterPhaseProps) {
  const { toggleShelterItem, markSheltered } = useStorm();
  const now = useNow(250);
  const elapsed = Math.max(0, now - storm.phaseStartedAt);
  const fraction = Math.min(1, elapsed / SHELTER_DURATION_MS);
  const remainingSeconds = Math.ceil(Math.max(0, SHELTER_DURATION_MS - elapsed) / 1000);

  const checked = storm.checkedItems;
  const total = SHELTER_CHECKLIST.length;
  const allChecked = checked.length === total;

  useEffect(() => {
    if (allChecked) markSheltered();
  }, [allChecked, markSheltered]);

  const chartData = useMemo(
    () =>
      Array.from({ length: CHART_STEPS + 1 }, (_, i) => {
        const t = (i / CHART_STEPS) * fraction;
        return { t, rate: ambientStormRate(storm.level, t) };
      }),
    [storm.level, fraction]
  );

  const liveRate = ambientStormRate(storm.level, fraction);
  const maxRate = ambientStormRate(storm.level, 1) * 1.1;
  const ambientSoFar = Math.round(stormUnprotectedDose(storm.level) * fraction * 100) / 100;
  const levelInfo = STORM_LEVELS[storm.level];
  const levelColor = statusColor(levelInfo.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-status-caution">Storm shelter phase</p>
          <p className="text-sm text-space-text mt-1">
            Complete the checklist to shelter. Storm ends in{' '}
            <span className="font-mono font-semibold tabular-nums">00:{String(remainingSeconds).padStart(2, '0')}</span>
          </p>
        </div>
        <span
          className="self-start sm:self-auto px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${levelColor}15`, color: levelColor }}
        >
          {storm.level} · {levelInfo.label}
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-space-muted mb-2">
          <span>Shelter checklist</span>
          <span className="tabular-nums">
            {checked.length} of {total} complete
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Shelter checklist progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={checked.length}
          className="h-1.5 rounded-full bg-space-border overflow-hidden mb-4"
        >
          <div
            className="h-full rounded-full bg-status-normal transition-all duration-300"
            style={{ width: `${(checked.length / total) * 100}%` }}
          />
        </div>

        <ul className="space-y-2">
          {SHELTER_CHECKLIST.map((item) => {
            const isChecked = checked.includes(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isChecked}
                  onClick={() => toggleShelterItem(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isChecked
                      ? 'border-status-normal/40 bg-status-normal/10'
                      : 'border-space-border bg-space-bg/40 hover:border-space-muted/50'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded-md border shrink-0 ${
                      isChecked ? 'border-status-normal bg-status-normal/20' : 'border-space-muted/60'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 text-status-normal" />}
                  </span>
                  <span className={isChecked ? 'text-space-muted line-through' : 'text-space-text'}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-xl border border-space-border bg-space-bg/40 p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] text-space-muted uppercase tracking-wider">Ambient dose rate (demo)</p>
            <p className="text-2xl font-bold text-space-text tabular-nums mt-1">
              {liveRate.toFixed(2)} <span className="text-xs text-space-muted font-normal">mSv/min</span>
            </p>
          </div>
          <p className="text-xs text-space-muted tabular-nums text-right">
            Ambient so far: {ambientSoFar.toFixed(2)} mSv
          </p>
        </div>
        <div className="h-24 w-full mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="stormRateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={RATE_COLOR} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={RATE_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" type="number" domain={[0, 1]} hide />
              <YAxis domain={[0, maxRate]} hide />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={RATE_COLOR}
                strokeWidth={2}
                fill="url(#stormRateGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <StormPhaseActions />
    </div>
  );
}
