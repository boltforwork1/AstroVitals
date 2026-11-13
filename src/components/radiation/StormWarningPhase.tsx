import { motion } from 'framer-motion';
import type { ActiveStorm } from '@/context/StormContext';
import { WARNING_DURATION_MS } from '@/data/radiationConfig';
import { useNow } from '@/hooks/useNow';
import StormPhaseActions from './StormPhaseActions';

const PARTICLE_ANGLES = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

interface StormWarningPhaseProps {
  storm: ActiveStorm;
}

export default function StormWarningPhase({ storm }: StormWarningPhaseProps) {
  const now = useNow(250);
  const remainingMs = Math.max(0, WARNING_DURATION_MS - (now - storm.phaseStartedAt));
  const seconds = Math.ceil(remainingMs / 1000);

  return (
    <div className="flex flex-col items-center text-center gap-5">
      <ParticleSun />
      <div>
        <p className="text-xs uppercase tracking-wider font-semibold text-status-critical">
          Solar particle event warning
        </p>
        <p className="text-sm text-space-text leading-relaxed mt-2 max-w-md mx-auto">
          Particles from a solar flare are expected to reach the station shortly. Go to the storm shelter now and
          follow the checklist.
        </p>
      </div>
      <p className="text-sm text-space-muted">
        Estimated arrival of particles:{' '}
        <span className="font-mono font-semibold text-space-text tabular-nums" aria-live="polite">
          00:{String(seconds).padStart(2, '0')}
        </span>
      </p>
      <StormPhaseActions />
    </div>
  );
}

function ParticleSun() {
  return (
    <div className="relative w-40 h-40" aria-hidden="true">
      <motion.div
        className="absolute inset-0 rounded-full bg-status-caution/20 blur-xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute left-1/2 top-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-status-caution/60"
        style={{ background: 'radial-gradient(circle at 35% 35%, #FDE68A, #F59E0B 55%, #B45309)' }}
      />
      {PARTICLE_ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const dx = Math.cos(rad) * 68;
        const dy = Math.sin(rad) * 68;
        return (
          <motion.span
            key={angle}
            className="absolute left-1/2 top-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-status-caution"
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: [0, dx], y: [0, dy], opacity: [0, 1, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: (i % 5) * 0.25 }}
          />
        );
      })}
    </div>
  );
}
