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
  shapes: React.ReactNode;
  labelPos: { x: number; y: number };
  labelSide: 'left' | 'right';
  anchor: { x: number; y: number };
}

const STATUS_LABEL: Record<string, string> = {
  normal: 'Normal',
  caution: 'Caution',
  critical: 'Critical',
};

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
  const beatDuration = 60 / heartRate; // seconds per beat

  const regionIds: RegionId[] = ['brain', 'eyes', 'heart', 'immune', 'gut', 'bones', 'muscles'];

  const getStatusFor = (id: RegionId) => {
    const result = getRegionStatus(id, record);
    return result;
  };

  const isDimmed = (id: RegionId): boolean => {
    if (!activeHazard) return false;
    const region = regionShapes.find((r) => r.id === id);
    if (!region) return true;
    return !regionMap_hazards[id].includes(activeHazard);
  };

  const regions = regionShapes.map((r) => {
    const status = getStatusFor(r.id);
    const color = statusColor(status.status);
    const dimmed = isDimmed(r.id);
    const isSelected = selectedRegion === r.id;
    const isHovered = hoveredRegion === r.id;

    return { ...r, status, color, dimmed, isSelected, isHovered };
  });

  const handleMouseMove = (e: React.MouseEvent, id: RegionId) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 300;
    const svgY = ((e.clientY - rect.top) / rect.height) * 640;
    setTooltip({ x: svgX, y: svgY, id });
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        ref={svgRef}
        viewBox="0 0 300 640"
        className="w-full h-full max-h-[600px]"
        style={{ filter: 'drop-shadow(0 0 20px rgba(34,211,238,0.06))' }}
      >
        <defs>
          <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F1626" />
            <stop offset="100%" stopColor="#0A1020" />
          </linearGradient>
          <linearGradient id="bodyStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1C2740" />
            <stop offset="100%" stopColor="#16203A" />
          </linearGradient>
          <radialGradient id="brainGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Body silhouette */}
        <g fill="url(#bodyFill)" stroke="url(#bodyStroke)" strokeWidth="1.5" strokeLinejoin="round">
          {/* Head */}
          <ellipse cx="150" cy="55" rx="38" ry="48" />
          {/* Neck */}
          <path d="M138 96 L138 112 L162 112 L162 96 Z" />
          {/* Torso */}
          <path d="M110 114 Q100 120 95 135 L85 260 Q82 290 90 320 L95 400 Q100 430 105 445 L195 445 Q200 430 205 400 L210 320 Q218 290 215 260 L205 135 Q200 120 190 114 Z" />
          {/* Left arm */}
          <path d="M95 130 Q75 135 68 160 L58 280 Q55 305 58 320 L68 322 L73 305 L82 175 Q85 155 92 138 Z" />
          {/* Right arm */}
          <path d="M205 130 Q225 135 232 160 L242 280 Q245 305 242 320 L232 322 L227 305 L218 175 Q215 155 208 138 Z" />
          {/* Left leg */}
          <path d="M105 445 Q95 460 92 490 L88 590 Q86 610 92 625 L108 625 Q112 615 114 600 L118 500 Q120 470 122 450 Z" />
          {/* Right leg */}
          <path d="M195 445 Q205 460 208 490 L212 590 Q214 610 208 625 L192 625 Q188 615 186 600 L182 500 Q180 470 178 450 Z" />
        </g>

        {/* Faint cyan glow overlay */}
        <ellipse cx="150" cy="300" rx="100" ry="280" fill="url(#brainGlow)" />

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
        <RegionTooltip
          id={tooltip.id}
          record={record}
          svgRef={svgRef}
        />
      )}
    </div>
  );
}

// Hazard lookup for dimming
const regionMap_hazards: Record<RegionId, HazardId[]> = {
  brain: ['isolation', 'radiation', 'closedEnvironment', 'gravity'],
  eyes: ['gravity', 'closedEnvironment'],
  heart: ['gravity', 'radiation'],
  immune: ['radiation', 'isolation', 'closedEnvironment'],
  gut: ['closedEnvironment', 'distance', 'isolation'],
  bones: ['gravity', 'radiation'],
  muscles: ['gravity', 'distance'],
};

// --- Region shape definitions ---
const regionShapes: RegionShape[] = [
  {
    id: 'brain',
    labelPos: { x: 250, y: 40 },
    labelSide: 'right',
    anchor: { x: 178, y: 50 },
    shapes: (
      <ellipse cx="150" cy="50" rx="28" ry="30" />
    ),
  },
  {
    id: 'eyes',
    labelPos: { x: 250, y: 70 },
    labelSide: 'right',
    anchor: { x: 172, y: 55 },
    shapes: (
      <>
        <ellipse cx="138" cy="50" rx="7" ry="5" />
        <ellipse cx="162" cy="50" rx="7" ry="5" />
      </>
    ),
  },
  {
    id: 'heart',
    labelPos: { x: 40, y: 170 },
    labelSide: 'left',
    anchor: { x: 128, y: 165 },
    shapes: (
      <path d="M138 150 C128 138 108 142 108 162 C108 180 128 195 138 205 C148 195 168 180 168 162 C168 142 148 138 138 150 Z" />
    ),
  },
  {
    id: 'immune',
    labelPos: { x: 250, y: 120 },
    labelSide: 'right',
    anchor: { x: 172, y: 120 },
    shapes: (
      <>
        <ellipse cx="150" cy="108" rx="10" ry="6" />
        <circle cx="135" cy="120" r="5" />
        <circle cx="165" cy="120" r="5" />
        <circle cx="140" cy="135" r="4" />
        <circle cx="160" cy="135" r="4" />
      </>
    ),
  },
  {
    id: 'gut',
    labelPos: { x: 40, y: 280 },
    labelSide: 'left',
    anchor: { x: 120, y: 280 },
    shapes: (
      <path d="M120 240 Q120 270 130 290 Q140 300 150 295 Q160 300 170 290 Q180 270 180 240 Z" />
    ),
  },
  {
    id: 'bones',
    labelPos: { x: 250, y: 420 },
    labelSide: 'right',
    anchor: { x: 170, y: 420 },
    shapes: (
      <>
        {/* Spine */}
        <line x1="150" y1="115" x2="150" y2="430" />
        {/* Left leg bones */}
        <line x1="105" y1="445" x2="98" y2="620" />
        {/* Right leg bones */}
        <line x1="195" y1="445" x2="202" y2="620" />
      </>
    ),
  },
  {
    id: 'muscles',
    labelPos: { x: 40, y: 220 },
    labelSide: 'left',
    anchor: { x: 82, y: 220 },
    shapes: (
      <>
        {/* Left upper arm */}
        <ellipse cx="75" cy="185" rx="12" ry="28" />
        {/* Right upper arm */}
        <ellipse cx="225" cy="185" rx="12" ry="28" />
        {/* Left thigh */}
        <ellipse cx="108" cy="480" rx="14" ry="35" />
        {/* Right thigh */}
        <ellipse cx="192" cy="480" rx="14" ry="35" />
      </>
    ),
  },
];

// --- Region Button Component ---
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
  const fillOpacity = dimmed ? 0.08 : isSelected ? 0.4 : isHovered ? 0.35 : 0.22;
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
      {/* Pulsing selection ring */}
      {isSelected && (
        <motion.rect
          x={0}
          y={0}
          width={300}
          height={640}
          fill="transparent"
          pointerEvents="none"
        />
      )}

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
          style={{ transformOrigin: '150px 320px', transformBox: 'fill-box' as React.CSSProperties['transformBox'] }}
        >
          <g
            fill={color}
            fillOpacity={fillOpacity}
            stroke={color}
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

      {/* Floating label with leader line */}
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

// --- Region Label ---
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
  const { labelPos, anchor, labelSide, id } = region;
  const names: Record<RegionId, string> = {
    brain: 'Brain',
    eyes: 'Eyes',
    heart: 'Heart',
    immune: 'Immune',
    gut: 'Gut',
    bones: 'Bones',
    muscles: 'Muscles',
  };

  const labelX = labelSide === 'left' ? labelPos.x : labelPos.x;
  const textAnchor = labelSide === 'left' ? 'end' : 'start';
  const lineEndX = labelSide === 'left' ? labelX + 40 : labelX - 40;

  return (
    <g opacity={dimmed ? 0.3 : 0.85} pointerEvents="none">
      <line
        x1={anchor.x}
        y1={anchor.y}
        x2={labelSide === 'left' ? lineEndX : lineEndX}
        y2={labelPos.y}
        stroke={color}
        strokeWidth="0.75"
        strokeDasharray="2 2"
        opacity={0.5}
      />
      <circle cx={labelSide === 'left' ? lineEndX : lineEndX} cy={labelPos.y} r="2" fill={color} opacity={0.6} />
      <text
        x={labelX}
        y={labelPos.y - 4}
        textAnchor={textAnchor}
        fill={color}
        fontSize="10"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
      >
        {names[id]}
      </text>
      <text
        x={labelX}
        y={labelPos.y + 8}
        textAnchor={textAnchor}
        fill="#8A97B5"
        fontSize="8"
        fontFamily="Inter, sans-serif"
      >
        {statusScore}/100
      </text>
    </g>
  );
}

// --- Tooltip ---
function RegionTooltip({
  id,
  record,
  svgRef,
}: {
  id: RegionId;
  record: DailyRecord;
  svgRef: React.RefObject<SVGSVGElement>;
}) {
  const status = getRegionStatus(id, record);
  const color = statusColor(status.status);
  const names: Record<RegionId, string> = {
    brain: 'Brain & Nervous System',
    eyes: 'Eyes & Vision',
    heart: 'Heart & Cardiovascular',
    immune: 'Immune System',
    gut: 'Gut & Metabolism',
    bones: 'Bones & Skeleton',
    muscles: 'Muscles',
  };

  return (
    <div
      className="absolute z-20 px-3 py-2 rounded-lg bg-space-surface border border-space-border shadow-xl pointer-events-none whitespace-nowrap"
      style={{
        left: '50%',
        top: '20%',
        transform: 'translateX(-50%)',
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
        />
        <span className="text-xs font-semibold text-space-text">{names[id]}</span>
      </div>
      <div className="text-xs text-space-muted mt-0.5">
        Score: <span className="font-medium tabular-nums" style={{ color }}>{status.score}</span>
        <span className="mx-1">·</span>
        <span style={{ color }}>{STATUS_LABEL[status.status]}</span>
      </div>
    </div>
  );
}
