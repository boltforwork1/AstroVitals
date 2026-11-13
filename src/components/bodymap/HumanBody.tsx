import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { DailyRecord } from '@/types/health';
import type { RegionId } from '@/data/bodyRegions';
import type { HazardId } from '@/data/hazards';
import { getRegionStatus } from '@/utils/regionStatus';
import { statusColor } from '@/utils/status';

interface HumanBodyProps {
  record: DailyRecord;
  selectedRegion: RegionId | null;
  onSelectRegion: (id: RegionId) => void;
  activeHazard: HazardId | null;
}

interface RegionShape {
  id: RegionId;
  anchor: { x: number; y: number };
  labelPos: { x: number; y: number };
  labelSide: 'left' | 'right';
  hitArea: React.ReactNode;
  shapes: React.ReactNode;
}

const STATUS_LABEL: Record<string, string> = {
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

// viewBox 300 x 640. Body centered at x=150.
const VB_W = 300;
const VB_H = 640;

const regionShapes: RegionShape[] = [
  {
    id: 'brain',
    anchor: { x: 150, y: 48 },
    labelPos: { x: 280, y: 44 },
    labelSide: 'right',
    hitArea: <rect x="108" y="10" width="84" height="68" rx="34" fill="transparent" />,
    shapes: <circle cx="150" cy="48" r="26" fillOpacity={0.22} />,
  },
  {
    id: 'eyes',
    anchor: { x: 150, y: 66 },
    labelPos: { x: 280, y: 100 },
    labelSide: 'right',
    hitArea: <rect x="118" y="56" width="64" height="20" rx="10" fill="transparent" />,
    shapes: (
      <>
        <ellipse cx="138" cy="66" rx="8" ry="5" fillOpacity={0.22} />
        <ellipse cx="162" cy="66" rx="8" ry="5" fillOpacity={0.22} />
      </>
    ),
  },
  {
    id: 'heart',
    anchor: { x: 134, y: 200 },
    labelPos: { x: 20, y: 200 },
    labelSide: 'left',
    hitArea: <rect x="98" y="168" width="60" height="64" rx="30" fill="transparent" />,
    shapes: (
      <path
        d="M136 176 C124 162 104 168 104 190 C104 210 124 226 136 236 C148 226 168 210 168 190 C168 168 148 162 136 176 Z"
        fillOpacity={0.22}
      />
    ),
  },
  {
    id: 'immune',
    anchor: { x: 150, y: 135 },
    labelPos: { x: 280, y: 160 },
    labelSide: 'right',
    hitArea: <rect x="104" y="108" width="92" height="50" rx="25" fill="transparent" />,
    shapes: (
      <>
        {/* Thymus at base of neck */}
        <ellipse cx="150" cy="124" rx="14" ry="9" fillOpacity={0.22} />
        {/* Lymph nodes */}
        <circle cx="134" cy="114" r="4" fillOpacity={0.22} />
        <circle cx="166" cy="114" r="4" fillOpacity={0.22} />
        <circle cx="120" cy="138" r="4" fillOpacity={0.22} />
        <circle cx="180" cy="138" r="4" fillOpacity={0.22} />
      </>
    ),
  },
  {
    id: 'gut',
    anchor: { x: 150, y: 310 },
    labelPos: { x: 20, y: 310 },
    labelSide: 'left',
    hitArea: <rect x="116" y="278" width="68" height="56" rx="28" fill="transparent" />,
    shapes: (
      <path
        d="M132 280 Q118 286 120 304 Q122 322 142 320 Q156 316 154 302 Q152 286 132 280 Z"
        fillOpacity={0.22}
      />
    ),
  },
  {
    id: 'bones',
    anchor: { x: 150, y: 420 },
    labelPos: { x: 280, y: 420 },
    labelSide: 'right',
    hitArea: <rect x="108" y="130" width="84" height="470" rx="40" fill="transparent" />,
    shapes: (
      <>
        {/* Spine */}
        <line x1="150" y1="130" x2="150" y2="400" strokeWidth={3} strokeOpacity={0.7} />
        {/* Left tibia */}
        <line x1="118" y1="450" x2="114" y2="600" strokeWidth={3} strokeOpacity={0.7} />
        {/* Right tibia */}
        <line x1="182" y1="450" x2="186" y2="600" strokeWidth={3} strokeOpacity={0.7} />
      </>
    ),
  },
  {
    id: 'muscles',
    anchor: { x: 150, y: 400 },
    labelPos: { x: 20, y: 460 },
    labelSide: 'left',
    hitArea: <rect x="68" y="155" width="164" height="380" rx="30" fill="transparent" />,
    shapes: (
      <>
        {/* Left upper arm */}
        <ellipse cx="82" cy="195" rx="12" ry="28" fillOpacity={0.22} />
        {/* Right upper arm */}
        <ellipse cx="218" cy="195" rx="12" ry="28" fillOpacity={0.22} />
        {/* Left thigh */}
        <ellipse cx="116" cy="470" rx="16" ry="38" fillOpacity={0.22} />
        {/* Right thigh */}
        <ellipse cx="184" cy="470" rx="16" ry="38" fillOpacity={0.22} />
      </>
    ),
  },
];

export default function HumanBody({
  record,
  selectedRegion,
  onSelectRegion,
  activeHazard,
}: HumanBodyProps) {
  const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; id: RegionId } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    const checkWidth = () => setShowLabels(window.innerWidth >= 768);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const heartRate = record.heartRate;
  const beatDuration = 60 / heartRate;

  const isDimmed = (id: RegionId): boolean => {
    if (!activeHazard) return false;
    return !regionMap_hazards[id].includes(activeHazard);
  };

  const regions = regionShapes.map((r) => {
    const status = getRegionStatus(r.id, record);
    const color = statusColor(status.status);
    const dimmed = isDimmed(r.id);
    const isSelected = selectedRegion === r.id;
    const isHovered = hoveredRegion === r.id;
    return { ...r, status, color, dimmed, isSelected, isHovered };
  });

  const handleMouseMove = (e: React.MouseEvent, id: RegionId) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * VB_W;
    const svgY = ((e.clientY - rect.top) / rect.height) * VB_H;
    setTooltip({ x: svgX, y: svgY, id });
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-full"
        style={{ maxHeight: '85vh', filter: 'drop-shadow(0 0 20px rgba(34,211,238,0.06))' }}
      >
        <defs>
          <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F1626" />
            <stop offset="100%" stopColor="#0A1020" />
          </linearGradient>
          <radialGradient id="bodyGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft cyan glow behind body */}
        <ellipse cx="150" cy="320" rx="90" ry="300" fill="url(#bodyGlow)" />

        {/* Body silhouette */}
        <g
          fill="url(#bodyFill)"
          stroke="#22D3EE"
          strokeWidth="1"
          strokeOpacity="0.25"
          strokeLinejoin="round"
        >
          {/* Head */}
          <ellipse cx="150" cy="50" rx="36" ry="42" />
          {/* Neck */}
          <path d="M138 90 L138 106 L162 106 L162 90 Z" />
          {/* Torso: shoulders → taper to waist → straight hip */}
          <path d="M108 110 Q96 116 92 130 L84 195 Q80 235 86 265 L92 300 Q96 340 100 380 L104 400 L196 400 L200 380 Q204 340 208 300 L214 265 Q220 235 216 195 L208 130 Q204 116 192 110 Z" />
          {/* Left arm */}
          <path d="M92 128 Q76 136 70 158 L60 235 Q56 275 58 305 L66 325 L76 323 L80 295 L86 255 L92 195 Q94 165 96 138 Z" />
          {/* Right arm */}
          <path d="M208 128 Q224 136 230 158 L240 235 Q244 275 242 305 L234 325 L224 323 L220 295 L214 255 L208 195 Q206 165 204 138 Z" />
          {/* Left leg */}
          <path d="M104 400 Q94 420 92 448 L86 535 Q82 575 86 605 L94 620 L108 618 Q110 608 112 588 L116 500 Q118 450 120 410 Z" />
          {/* Right leg */}
          <path d="M196 400 Q206 420 208 448 L214 535 Q218 575 214 605 L206 620 L192 618 Q190 608 188 588 L184 500 Q182 450 180 410 Z" />
        </g>

        {/* Region shapes */}
        {regions.map((r) => (
          <RegionButton
            key={r.id}
            region={r}
            beatDuration={beatDuration}
            showLabels={showLabels}
            onSelect={() => onSelectRegion(r.id)}
            onHover={(hovered) => setHoveredRegion(hovered ? r.id : null)}
            onTooltipMove={(e) => handleMouseMove(e, r.id)}
            onTooltipLeave={() => setTooltip(null)}
          />
        ))}
      </svg>

      {/* Floating tooltip */}
      {tooltip && hoveredRegion && (
        <RegionTooltip id={hoveredRegion} record={record} />
      )}
    </div>
  );
}

interface RegionButtonProps {
  region: RegionShape & {
    status: ReturnType<typeof getRegionStatus>;
    color: string;
    dimmed: boolean;
    isSelected: boolean;
    isHovered: boolean;
  };
  beatDuration: number;
  showLabels: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  onTooltipMove: (e: React.MouseEvent) => void;
  onTooltipLeave: () => void;
}

function RegionButton({
  region,
  beatDuration,
  showLabels,
  onSelect,
  onHover,
  onTooltipMove,
  onTooltipLeave,
}: RegionButtonProps) {
  const { color, dimmed, isSelected, isHovered } = region;
  const isHeart = region.id === 'heart';
  const fillOpacity = dimmed ? 0.08 : isSelected ? 0.4 : isHovered ? 0.35 : 0.25;
  const strokeOpacity = dimmed ? 0.3 : 1;
  const strokeWidth = isSelected ? 3 : isHovered ? 2.5 : 2;
  const overallOpacity = dimmed ? 0.25 : 1;

  return (
    <g
      opacity={overallOpacity}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => { onHover(false); onTooltipLeave(); }}
      onMouseMove={onTooltipMove}
    >
      <g
        role="button"
        tabIndex={0}
        aria-label={`${region.id}: score ${region.status.score}, ${STATUS_LABEL[region.status.status]}`}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        style={{ cursor: dimmed ? 'default' : 'pointer', outline: 'none' }}
        onFocus={() => onHover(true)}
        onBlur={() => { onHover(false); onTooltipLeave(); }}
      >
        <g pointerEvents="all">{region.hitArea}</g>

        <motion.g
          animate={
            isHeart
              ? { scale: [1, 1.08, 1] }
              : isSelected
                ? { scale: [1, 1.04, 1] }
                : { scale: 1 }
          }
          transition={
            isHeart
              ? { duration: beatDuration, repeat: Infinity, ease: 'easeInOut' }
              : isSelected
                ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0 }
          }
          style={{ transformOrigin: `${region.anchor.x}px ${region.anchor.y}px`, transformBox: 'fill-box' as React.CSSProperties['transformBox'] }}
        >
          <g
            fill={color}
            stroke={color}
            fillOpacity={fillOpacity}
            strokeOpacity={strokeOpacity}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: isHovered || isSelected ? `drop-shadow(0 0 6px ${color}80)` : 'none',
              transition: 'filter 0.2s, fill-opacity 0.2s, stroke-width 0.2s',
            }}
          >
            {region.shapes}
          </g>
        </motion.g>
      </g>

      {showLabels && (
        <RegionLabel
          region={region}
          color={color}
          dimmed={dimmed}
          statusScore={region.status.score}
        />
      )}
    </g>
  );
}

function RegionLabel({
  region,
  color,
  dimmed,
  statusScore,
}: {
  region: RegionShape;
  color: string;
  dimmed: boolean;
  statusScore: number;
}) {
  const { anchor, labelPos, labelSide, id } = region;
  const textAnchor = labelSide === 'left' ? 'start' : 'end';
  const bendX = labelSide === 'left' ? 60 : 240;
  const labelEndX = labelSide === 'left' ? labelPos.x + 34 : labelPos.x - 34;

  return (
    <g opacity={dimmed ? 0.3 : 0.85} pointerEvents="none">
      <line x1={anchor.x} y1={anchor.y} x2={bendX} y2={labelPos.y} stroke={color} strokeWidth="0.6" strokeDasharray="2 2" opacity={0.5} />
      <line x1={bendX} y1={labelPos.y} x2={labelEndX} y2={labelPos.y} stroke={color} strokeWidth="0.6" strokeDasharray="2 2" opacity={0.5} />
      <circle cx={anchor.x} cy={anchor.y} r="2" fill={color} opacity={0.7} />
      <text x={labelPos.x} y={labelPos.y - 3} textAnchor={textAnchor} fill={color} fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">
        {REGION_NAMES[id]}
      </text>
      <text x={labelPos.x} y={labelPos.y + 8} textAnchor={textAnchor} fill="#8A97B5" fontSize="8" fontFamily="Inter, sans-serif">
        {statusScore}/100
      </text>
    </g>
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
