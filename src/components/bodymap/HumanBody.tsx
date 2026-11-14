import { useState, useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { DailyRecord, Status } from '@/types/health';
import type { RegionId } from '@/data/bodyRegions';
import type { HazardId } from '@/data/hazards';
import { getRegionStatus } from '@/utils/regionStatus';
import { statusColor } from '@/utils/status';
import {
  ANCHORS,
  BODY_PATH,
  BONES,
  BRAIN,
  EYES,
  GUT,
  HEAD,
  HEART,
  IMMUNE,
  MUSCLES,
} from '@/components/bodymap/bodyGeometry';

interface HumanBodyProps {
  record: DailyRecord;
  selectedRegion: RegionId | null;
  onSelectRegion: (id: RegionId) => void;
  activeHazard: HazardId | null;
}

interface RegionState {
  status: Status;
  score: number;
  color: string;
  dimmed: boolean;
  active: boolean;
  opacity: number;
}

const STATUS_LABEL: Record<Status, string> = {
  normal: 'Normal',
  caution: 'Caution',
  critical: 'Critical',
};

const REGION_NAMES: Record<RegionId, string> = {
  brain: 'Brain',
  eyes: 'Eyes',
  heart: 'Heart',
  immune: 'Immune',
  gut: 'Gut',
  bones: 'Bones',
  muscles: 'Muscles',
};

const REGION_FULL_NAMES: Record<RegionId, string> = {
  brain: 'Brain & Nervous System',
  eyes: 'Eyes & Vision',
  heart: 'Heart & Cardiovascular',
  immune: 'Immune System',
  gut: 'Gut & Metabolism',
  bones: 'Bones & Skeleton',
  muscles: 'Muscles',
};

const regionMap_hazards: Record<RegionId, HazardId[]> = {
  brain: ['isolation', 'radiation', 'closedEnvironment', 'gravity'],
  eyes: ['gravity', 'closedEnvironment'],
  heart: ['gravity', 'radiation'],
  immune: ['radiation', 'isolation', 'closedEnvironment'],
  gut: ['closedEnvironment', 'distance', 'isolation'],
  bones: ['gravity', 'radiation'],
  muscles: ['gravity', 'distance'],
};

const LEFT_LABEL_IDS: RegionId[] = ['heart', 'gut', 'muscles'];
const RIGHT_LABEL_IDS: RegionId[] = ['brain', 'eyes', 'immune', 'bones'];
const LIMB_LONG_BONES = ['radius', 'ulna', 'tibia', 'fibula'];

const SKELETON_BASE = 0.6;
const MUSCLE_BASE = 0.8;
const ORGAN_BASE = 1;

const organPaint = (c: string, b: number) => ({
  fill: c,
  fillOpacity: 0.25,
  stroke: c,
  strokeWidth: 2 + b,
  pointerEvents: 'all' as const,
});

function renderBones(c: string, b: number) {
  const sw = (n: number) => n + b;
  const fillPaint = {
    fill: c,
    fillOpacity: 0.25,
    stroke: c,
    strokeWidth: sw(1),
    pointerEvents: 'all' as const,
  };
  const strokePaint = {
    fill: 'none',
    stroke: c,
    pointerEvents: 'stroke' as const,
  };
  return (
    <>
      <line x1={150} y1={100} x2={150} y2={340} stroke="transparent" strokeWidth={10} pointerEvents="all" />
      {BONES.clavicles.map((d, i) => (
        <path key={`hit-clav-${i}`} d={d} fill="none" stroke="transparent" strokeWidth={10} pointerEvents="all" />
      ))}
      {BONES.ribs.map((d, i) => (
        <path key={`hit-rib-${i}`} d={d} fill="none" stroke="transparent" strokeWidth={8} pointerEvents="all" />
      ))}
      {BONES.longBones
        .filter(([name]) => LIMB_LONG_BONES.includes(name))
        .map(([name, x1, y1, x2, y2, w]) => (
          <line
            key={`hit-${name}-${x1}-${y1}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="transparent"
            strokeWidth={w + 10}
            pointerEvents="all"
          />
        ))}

      {BONES.vertebrae.map(([cx, cy, w, h], i) => (
        <rect
          key={`vert-${i}`}
          x={cx - w / 2}
          y={cy - h / 2}
          width={w}
          height={h}
          rx={2}
          {...fillPaint}
        />
      ))}
      <path d={BONES.sacrum} {...fillPaint} />
      <path d={BONES.sternum} {...fillPaint} />
      {BONES.pelvis.map((d, i) => (
        <path key={`pelvis-${i}`} d={d} {...fillPaint} />
      ))}
      <path d={BONES.pubis} {...strokePaint} strokeWidth={sw(1.4)} />
      {BONES.clavicles.map((d, i) => (
        <path key={`clav-${i}`} d={d} {...strokePaint} strokeWidth={sw(2.2)} strokeLinecap="round" />
      ))}
      {BONES.ribs.map((d, i) => (
        <path key={`rib-${i}`} d={d} {...strokePaint} strokeWidth={sw(1.2)} strokeLinecap="round" />
      ))}
      {BONES.handsFeet.map((d, i) => (
        <path key={`hf-${i}`} d={d} {...strokePaint} strokeWidth={sw(1.6)} strokeLinecap="round" />
      ))}
      {BONES.longBones.map(([name, x1, y1, x2, y2, w]) => (
        <line
          key={`long-${name}-${x1}-${y1}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={c}
          strokeWidth={sw(w)}
          strokeLinecap="round"
          pointerEvents="stroke"
        />
      ))}
      {BONES.joints.map(([cx, cy, r], i) => (
        <circle
          key={`joint-${i}`}
          cx={cx}
          cy={cy}
          r={r}
          fill={c}
          fillOpacity={0.1}
          stroke={c}
          strokeWidth={sw(1)}
          pointerEvents="all"
        />
      ))}
    </>
  );
}

function renderMuscles(c: string, b: number) {
  return (
    <>
      {MUSCLES.map((m, i) => (
        <g key={`muscle-${m.kind}-${i}`}>
          <path
            d={m.d}
            fill={c}
            fillOpacity={0.2}
            stroke={c}
            strokeWidth={1.8 + b}
            pointerEvents="all"
          />
          {m.fibres.map((d, j) => (
            <path
              key={`fibre-${j}`}
              d={d}
              fill="none"
              stroke={c}
              strokeWidth={1.2 + b}
              opacity={0.6}
              pointerEvents="stroke"
            />
          ))}
        </g>
      ))}
    </>
  );
}

function renderImmune(c: string, b: number) {
  return (
    <>
      <circle cx={150} cy={152} r={24} fill="transparent" pointerEvents="all" />
      {IMMUNE.nodes.map(([x, y], i) => (
        <circle key={`hit-node-${i}`} cx={x} cy={y} r={9} fill="transparent" pointerEvents="all" />
      ))}
      <path d={IMMUNE.thymus} {...organPaint(c, b)} />
      {IMMUNE.nodes.map(([x, y, r], i) => (
        <circle key={`node-${i}`} cx={x} cy={y} r={r} {...organPaint(c, b)} />
      ))}
    </>
  );
}

function renderGut(c: string, b: number) {
  return (
    <>
      <rect x={118} y={236} width={64} height={94} rx={14} fill="transparent" pointerEvents="all" />
      <path d={GUT.stomach} {...organPaint(c, b)} />
      <path
        d={GUT.colon}
        fill="none"
        stroke={c}
        strokeWidth={5 + b}
        strokeOpacity={0.7}
        strokeLinecap="round"
        pointerEvents="stroke"
      />
      <path
        d={GUT.intestine}
        fill="none"
        stroke={c}
        strokeWidth={2.6 + b}
        strokeLinecap="round"
        pointerEvents="stroke"
      />
    </>
  );
}

function renderHeart(c: string, b: number) {
  return (
    <>
      <path d={HEART} fill="none" stroke="transparent" strokeWidth={14} pointerEvents="all" />
      <path d={HEART} {...organPaint(c, b)} />
    </>
  );
}

function renderBrain(c: string, b: number) {
  return (
    <>
      <path d={BRAIN.outline} fill="none" stroke="transparent" strokeWidth={10} pointerEvents="all" />
      <path d={BRAIN.outline} {...organPaint(c, b)} />
      {BRAIN.folds.map((d, i) => (
        <path
          key={`fold-${i}`}
          d={d}
          fill="none"
          stroke={c}
          strokeWidth={1.2 + b}
          strokeLinecap="round"
          pointerEvents="stroke"
        />
      ))}
    </>
  );
}

function renderEyes(c: string, b: number) {
  return (
    <>
      {EYES.shapes.map((d, i) => (
        <path key={`eye-hit-${i}`} d={d} fill="none" stroke="transparent" strokeWidth={14} pointerEvents="all" />
      ))}
      {EYES.shapes.map((d, i) => (
        <path key={`eye-${i}`} d={d} {...organPaint(c, b)} />
      ))}
      {EYES.pupils.map(([x, y, r], i) => (
        <circle key={`pupil-${i}`} cx={x} cy={y} r={r} fill={c} pointerEvents="all" />
      ))}
    </>
  );
}

interface RegionGroupProps {
  id: RegionId;
  state: RegionState;
  selected: boolean;
  beatDuration: number;
  onSelect: (id: RegionId) => void;
  onHover: (id: RegionId | null) => void;
  children: (color: string, boost: number) => ReactNode;
}

function RegionGroup({ id, state, selected, beatDuration, onSelect, onHover, children }: RegionGroupProps) {
  const isHeart = id === 'heart';
  const animate = isHeart
    ? { scale: [1, 1.04, 1] }
    : selected
      ? { scale: [1, 1.02, 1] }
      : { scale: 1 };
  const transition = isHeart
    ? { duration: beatDuration, repeat: Infinity, ease: 'easeInOut' as const }
    : selected
      ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const }
      : { duration: 0 };

  return (
    <motion.g
      role="button"
      tabIndex={0}
      aria-label={`${REGION_NAMES[id]}: score ${state.score}, ${STATUS_LABEL[state.status]}`}
      onPointerEnter={() => onHover(id)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(id)}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(id);
        }
      }}
      animate={animate}
      transition={transition}
      style={{
        cursor: state.dimmed ? 'default' : 'pointer',
        outline: 'none',
        transformBox: 'fill-box' as CSSProperties['transformBox'],
        transformOrigin: 'center',
      }}
    >
      <g
        opacity={state.opacity}
        style={{
          transition: 'opacity 0.25s ease, filter 0.25s ease',
          filter: state.active ? `drop-shadow(0 0 6px ${state.color}80)` : 'none',
        }}
      >
        {children(state.color, state.active ? 1 : 0)}
      </g>
    </motion.g>
  );
}

export default function HumanBody({
  record,
  selectedRegion,
  onSelectRegion,
  activeHazard,
}: HumanBodyProps) {
  const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    const checkWidth = () => setShowLabels(window.innerWidth >= 768);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const beatDuration = 60 / record.heartRate;
  const focusId = hoveredRegion ?? selectedRegion;

  const isDimmed = (id: RegionId): boolean => {
    if (!activeHazard) return false;
    return !regionMap_hazards[id].includes(activeHazard);
  };

  const stateOf = (id: RegionId, base: number): RegionState => {
    const { status, score } = getRegionStatus(id, record);
    const dimmed = isDimmed(id);
    const active = focusId === id;
    const opacity = dimmed ? 0.25 : active ? 1 : focusId ? 0.3 : base;
    return { status, score, color: statusColor(status), dimmed, active, opacity };
  };

  const renderGroup = (id: RegionId, base: number, paint: (c: string, b: number) => ReactNode) => (
    <RegionGroup
      key={id}
      id={id}
      state={stateOf(id, base)}
      selected={selectedRegion === id}
      beatDuration={beatDuration}
      onSelect={onSelectRegion}
      onHover={setHoveredRegion}
    >
      {paint}
    </RegionGroup>
  );

  const renderLabel = (id: RegionId, left: boolean) => {
    const { status, score } = getRegionStatus(id, record);
    const color = statusColor(status);
    const [ax, ay] = ANCHORS[id];
    const labelX = left ? 20 : 280;
    const lineStartX = left ? 24 : 276;
    return (
      <g key={`label-${id}`} opacity={isDimmed(id) ? 0.3 : 1} pointerEvents="none">
        <line
          x1={lineStartX}
          y1={ay}
          x2={ax}
          y2={ay}
          stroke={color}
          strokeWidth={0.8}
          strokeDasharray="2 2"
          opacity={0.5}
        />
        <circle cx={ax} cy={ay} r={2} fill={color} />
        <text
          x={labelX}
          y={ay - 2}
          textAnchor={left ? 'end' : 'start'}
          fill={color}
          fontSize={10}
          fontWeight={600}
          fontFamily="Inter, sans-serif"
        >
          {REGION_NAMES[id]}
        </text>
        <text
          x={labelX}
          y={ay + 9}
          textAnchor={left ? 'end' : 'start'}
          fill="#8A97B5"
          fontSize={9}
          fontFamily="Inter, sans-serif"
        >
          {score}/100
        </text>
      </g>
    );
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="-70 0 440 710"
        className="w-full h-auto mx-auto"
        style={{ maxHeight: '80vh', filter: 'drop-shadow(0 0 20px rgba(34,211,238,0.06))' }}
        role="group"
        aria-label="Body map"
      >
        <ellipse cx={150} cy={355} rx={130} ry={340} fill="#22D3EE" fillOpacity={0.05} pointerEvents="none" />

        <path
          d={BODY_PATH}
          fill="#0F1A30"
          stroke="#22D3EE"
          strokeOpacity={0.5}
          strokeWidth={1.4}
          strokeLinejoin="round"
          pointerEvents="none"
        />
        <ellipse
          cx={HEAD.cx}
          cy={HEAD.cy}
          rx={HEAD.rx}
          ry={HEAD.ry}
          fill="#0F1A30"
          stroke="#22D3EE"
          strokeOpacity={0.5}
          strokeWidth={1.4}
          pointerEvents="none"
        />

        {renderGroup('bones', SKELETON_BASE, renderBones)}
        {renderGroup('muscles', MUSCLE_BASE, renderMuscles)}
        {renderGroup('immune', ORGAN_BASE, renderImmune)}
        {renderGroup('gut', ORGAN_BASE, renderGut)}
        {renderGroup('heart', ORGAN_BASE, renderHeart)}
        {renderGroup('brain', ORGAN_BASE, renderBrain)}
        {renderGroup('eyes', ORGAN_BASE, renderEyes)}

        {showLabels && (
          <g pointerEvents="none">
            {LEFT_LABEL_IDS.map((id) => renderLabel(id, true))}
            {RIGHT_LABEL_IDS.map((id) => renderLabel(id, false))}
          </g>
        )}
      </svg>

      {hoveredRegion && <RegionTooltip id={hoveredRegion} record={record} />}
    </div>
  );
}

function RegionTooltip({ id, record }: { id: RegionId; record: DailyRecord }) {
  const status = getRegionStatus(id, record);
  const color = statusColor(status.status);

  return (
    <div
      className="absolute z-20 px-3 py-2 rounded-lg bg-space-surface border border-space-border shadow-xl pointer-events-none whitespace-nowrap"
      style={{ left: '50%', top: '16%', transform: 'translateX(-50%)' }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
        />
        <span className="text-xs font-semibold text-space-text">{REGION_FULL_NAMES[id]}</span>
      </div>
      <div className="text-xs text-space-muted mt-0.5">
        Score: <span className="font-medium tabular-nums" style={{ color }}>{status.score}</span>
        <span className="mx-1">·</span>
        <span style={{ color }}>{STATUS_LABEL[status.status]}</span>
      </div>
    </div>
  );
}
