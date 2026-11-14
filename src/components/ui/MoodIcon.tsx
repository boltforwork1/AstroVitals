import { motion } from 'framer-motion';
import { getStatus, statusColor } from '@/utils/status';

const SIZE_PX: Record<'sm' | 'md' | 'lg', number> = {
  sm: 32,
  md: 48,
  lg: 72,
};

const MUTED_COLOR = '#8A97B5';
const ACCENT_COLOR = '#22D3EE';
const TRACK_COLOR = '#1C2740';
const RING_STROKE_WIDTH = 3;
const FACE_STROKE_WIDTH = 2;
const RING_RADIUS = 22;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const MOUTH_PATHS: Record<number, string> = {
  1: 'M15 34 C20 27 28 27 33 34',
  2: 'M15 32 C20 28 28 28 33 32',
  3: 'M16 30 H32',
  4: 'M15 29 C20 32 28 32 33 29',
  5: 'M15 28 C20 35 28 35 33 28',
};

export interface MoodIconProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showRing?: boolean;
  selected?: boolean;
  animate?: boolean;
}

export function MoodIcon({
  level,
  size = 'md',
  showRing = true,
  selected,
  animate = true,
}: MoodIconProps) {
  const roundedLevel = Math.max(1, Math.min(5, Math.round(level)));
  const status = getStatus('mood', level);
  const statusCol = statusColor(status);

  const isSelector = selected !== undefined;
  const faceColor = isSelector
    ? selected
      ? ACCENT_COLOR
      : MUTED_COLOR
    : statusCol;

  const ringColor = faceColor;
  const ringProgress = (roundedLevel - 1) / 4;
  const ringOffset = RING_CIRCUMFERENCE * (1 - ringProgress);

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldAnimate = animate && !reduceMotion;

  const ariaLabel = `Mood ${level.toFixed(1)} out of 5, ${status}`;
  const svgSize = SIZE_PX[size];
  const mouthPath = MOUTH_PATHS[roundedLevel] ?? MOUTH_PATHS[3];

  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox="0 0 48 48"
      role="img"
      aria-label={ariaLabel}
    >
      {showRing && (
        <>
          <circle
            cx="24"
            cy="24"
            r={RING_RADIUS}
            fill="none"
            stroke={TRACK_COLOR}
            strokeWidth={RING_STROKE_WIDTH}
          />
          <motion.circle
            cx="24"
            cy="24"
            r={RING_RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth={RING_STROKE_WIDTH}
            strokeLinecap="round"
            transform="rotate(-90 24 24)"
            strokeDasharray={RING_CIRCUMFERENCE}
            initial={shouldAnimate ? { strokeDashoffset: RING_CIRCUMFERENCE } : false}
            animate={{ strokeDashoffset: ringOffset }}
            transition={{ duration: shouldAnimate ? 0.6 : 0, ease: 'easeOut' }}
          />
        </>
      )}

      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke={faceColor}
        strokeWidth={FACE_STROKE_WIDTH}
      />

      {roundedLevel <= 2 && (
        <>
          <line
            x1="13"
            y1="17"
            x2="20"
            y2="19"
            stroke={faceColor}
            strokeWidth={FACE_STROKE_WIDTH}
            strokeLinecap="round"
          />
          <line
            x1="35"
            y1="17"
            x2="28"
            y2="19"
            stroke={faceColor}
            strokeWidth={FACE_STROKE_WIDTH}
            strokeLinecap="round"
          />
        </>
      )}

      <circle cx="17" cy="22" r="1.5" fill={faceColor} />
      <circle cx="31" cy="22" r="1.5" fill={faceColor} />

      <motion.path
        key={mouthPath}
        d={mouthPath}
        fill="none"
        stroke={faceColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        initial={shouldAnimate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: shouldAnimate ? 0.25 : 0 }}
      />
    </svg>
  );
}

export function getMoodLabel(level: number): string {
  const rounded = Math.max(1, Math.min(5, Math.round(level)));
  const labels: Record<number, string> = {
    1: 'Very low',
    2: 'Low',
    3: 'Neutral',
    4: 'Good',
    5: 'Very good',
  };
  return labels[rounded];
}
