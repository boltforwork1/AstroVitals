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

// --- Region definitions ---
// viewBox is 320 x 760. Body is centered at x=160.
// Proportions: 7.5 head-heights. Head height = 760/7.5 ≈ 101.
const regionShapes: RegionShape[] = [
  {
    id: 'brain',
    anchor: { x: 160, y: 55 },
    labelPos: { x: 18, y: 50 },
    labelSide: 'left',
    hitArea: <rect x="108" y="14" width="104" height="72" rx="50" fill="transparent" />,
    shapes: (
      <>
        {/* Two-lobe cranium outline */}
        <path
          d="M160 18 C138 18 118 34 118 56 C118 68 124 78 132 84 L132 90 C132 94 136 96 140 96 L180 96 C184 96 188 94 188 90 L188 84 C196 78 202 68 202 56 C202 34 182 18 160 18 Z"
          fillOpacity={0.22}
        />
        {/* Central fissure */}
        <line x1="160" y1="20" x2="160" y2="92" strokeOpacity={0.5} strokeWidth={1} />
        {/* Fold lines left */}
        <path d="M138 36 Q146 40 142 48 Q138 54 144 60 Q148 66 142 72" fill="none" strokeOpacity={0.4} strokeWidth={0.8} />
        {/* Fold lines right */}
        <path d="M182 36 Q174 40 178 48 Q182 54 176 60 Q172 66 178 72" fill="none" strokeOpacity={0.4} strokeWidth={0.8} />
        {/* Cerebellum bump at bottom */}
        <ellipse cx="160" cy="88" rx="14" ry="8" fillOpacity={0.18} />
      </>
    ),
  },
  {
    id: 'eyes',
    anchor: { x: 160, y: 112 },
    labelPos: { x: 302, y: 110 },
    labelSide: 'right',
    hitArea: <rect x="118" y="100" width="84" height="22" rx="10" fill="transparent" />,
    shapes: (
      <>
        <ellipse cx="142" cy="112" rx="9" ry="6" fillOpacity={0.22} />
        <ellipse cx="178" cy="112" rx="9" ry="6" fillOpacity={0.22} />
        <circle cx="144" cy="113" r="2.5" fillOpacity={0.6} stroke="none" />
        <circle cx="176" cy="113" r="2.5" fillOpacity={0.6} stroke="none" />
      </>
    ),
  },
  {
    id: 'heart',
    anchor: { x: 140, y: 220 },
    labelPos: { x: 18, y: 220 },
    labelSide: 'left',
    hitArea: <rect x="108" y="184" width="64" height="72" rx="30" fill="transparent" />,
    shapes: (
      <path
        d="M142 196 C128 180 104 186 104 210 C104 232 128 250 142 262 C156 250 180 232 180 210 C180 186 156 180 142 196 Z"
        fillOpacity={0.22}
      />
    ),
  },
  {
    id: 'immune',
    anchor: { x: 160, y: 200 },
    labelPos: { x: 302, y: 200 },
    labelSide: 'right',
    hitArea: <rect x="96" y="150" width="128" height="60" rx="28" fill="transparent" />,
    shapes: (
      <>
        {/* Thymus - upper chest */}
        <path
          d="M152 168 L148 182 Q148 196 160 198 Q172 196 172 182 L168 168 Z"
          fillOpacity={0.22}
        />
        {/* Lymph nodes - neck */}
        <circle cx="140" cy="140" r="4" fillOpacity={0.22} />
        <circle cx="180" cy="140" r="4" fillOpacity={0.22} />
        {/* Lymph nodes - left armpit */}
        <circle cx="112" cy="188" r="4" fillOpacity={0.22} />
        <circle cx="118" cy="196" r="3" fillOpacity={0.2} />
        {/* Lymph nodes - right armpit */}
        <circle cx="208" cy="188" r="4" fillOpacity={0.22} />
        <circle cx="202" cy="196" r="3" fillOpacity={0.2} />
      </>
    ),
  },
  {
    id: 'gut',
    anchor: { x: 160, y: 340 },
    labelPos: { x: 18, y: 340 },
    labelSide: 'left',
    hitArea: <rect x="116" y="280" width="88" height="100" rx="44" fill="transparent" />,
    shapes: (
      <>
        {/* Stomach - upper abdomen */}
        <path
          d="M136 280 Q124 286 126 300 Q128 312 142 310 Q150 306 150 296 Q150 284 136 280 Z"
          fillOpacity={0.22}
        />
        {/* Intestines - winding coil */}
        <path
          d="M132 316 Q120 316 120 330 Q120 344 134 344 Q148 344 148 330 Q148 316 162 316 Q176 316 176 330 Q176 344 190 344 Q204 344 204 330 Q204 316 192 316"
          fill="none"
          strokeWidth={3}
          fillOpacity={0}
          strokeOpacity={0.7}
        />
        <path
          d="M192 320 Q184 330 192 340 Q200 348 188 356 Q176 360 164 356 Q152 352 140 356 Q128 360 120 352"
          fill="none"
          strokeWidth={3}
          fillOpacity={0}
          strokeOpacity={0.7}
        />
        <path
          d="M120 348 Q130 356 140 350 Q150 344 160 350 Q170 356 180 350 Q190 344 198 352"
          fill="none"
          strokeWidth={2.5}
          fillOpacity={0}
          strokeOpacity={0.5}
        />
      </>
    ),
  },
  {
    id: 'bones',
    anchor: { x: 160, y: 460 },
    labelPos: { x: 302, y: 460 },
    labelSide: 'right',
    hitArea: <rect x="64" y="150" width="192" height="530" rx="40" fill="transparent" />,
    shapes: (
      <>
        {/* Ribcage - left side */}
        <path d="M130 200 Q108 206 102 218" fill="none" strokeWidth={2} strokeOpacity={0.6} />
        <path d="M130 212 Q106 218 100 232" fill="none" strokeWidth={2} strokeOpacity={0.6} />
        <path d="M132 224 Q106 230 98 246" fill="none" strokeWidth={2} strokeOpacity={0.6} />
        <path d="M134 236 Q108 242 100 258" fill="none" strokeWidth={2} strokeOpacity={0.6} />
        {/* Ribcage - right side */}
        <path d="M190 200 Q212 206 218 218" fill="none" strokeWidth={2} strokeOpacity={0.6} />
        <path d="M190 212 Q214 218 220 232" fill="none" strokeWidth={2} strokeOpacity={0.6} />
        <path d="M188 224 Q214 230 222 246" fill="none" strokeWidth={2} strokeOpacity={0.6} />
        <path d="M186 236 Q212 242 220 258" fill="none" strokeWidth={2} strokeOpacity={0.6} />
        {/* Sternum */}
        <line x1="160" y1="196" x2="160" y2="248" strokeWidth={2} strokeOpacity={0.5} />
        {/* Spine with vertebrae marks */}
        <line x1="160" y1="150" x2="160" y2="430" strokeWidth={2.5} strokeOpacity={0.5} />
        {Array.from({ length: 10 }).map((_, i) => {
          const y = 168 + i * 26;
          return <line key={`v${i}`} x1="153" y1={y} x2="167" y2={y} strokeWidth={1.5} strokeOpacity={0.5} />;
        })}
        {/* Pelvis */}
        <path
          d="M118 400 Q108 410 112 426 Q116 440 132 442 L148 442 Q152 436 160 434 Q168 436 172 442 L188 442 Q204 440 208 426 Q212 410 202 400"
          fill="none"
          strokeWidth={2.5}
          strokeOpacity={0.6}
        />
        {/* Left arm bones */}
        <line x1="120" y1="188" x2="102" y2="248" strokeWidth={2} strokeOpacity={0.5} />
        <line x1="102" y1="248" x2="92" y2="310" strokeWidth={2} strokeOpacity={0.5} />
        <line x1="92" y1="310" x2="88" y2="360" strokeWidth={2} strokeOpacity={0.5} />
        {/* Right arm bones */}
        <line x1="200" y1="188" x2="218" y2="248" strokeWidth={2} strokeOpacity={0.5} />
        <line x1="218" y1="248" x2="228" y2="310" strokeWidth={2} strokeOpacity={0.5} />
        <line x1="228" y1="310" x2="232" y2="360" strokeWidth={2} strokeOpacity={0.5} />
        {/* Left leg bones */}
        <line x1="140" y1="436" x2="132" y2="560" strokeWidth={2} strokeOpacity={0.5} />
        <line x1="132" y1="560" x2="130" y2="660" strokeWidth={2} strokeOpacity={0.5} />
        {/* Right leg bones */}
        <line x1="180" y1="436" x2="188" y2="560" strokeWidth={2} strokeOpacity={0.5} />
        <line x1="188" y1="560" x2="190" y2="660" strokeWidth={2} strokeOpacity={0.5} />
        {/* Joint circles */}
        {[
          [120, 188], [102, 248], [92, 310],
          [200, 188], [218, 248], [228, 310],
          [140, 436], [132, 560], [130, 660],
          [180, 436], [188, 560], [190, 660],
        ].map(([cx, cy], i) => (
          <circle key={`j${i}`} cx={cx} cy={cy} r={3.5} fillOpacity={0.3} strokeOpacity={0.6} />
        ))}
      </>
    ),
  },
  {
    id: 'muscles',
    anchor: { x: 160, y: 320 },
    labelPos: { x: 18, y: 470 },
    labelSide: 'left',
    hitArea: <rect x="80" y="188" width="160" height="440" rx="30" fill="transparent" />,
    shapes: (
      <>
        {/* Pectorals */}
        <ellipse cx="142" cy="214" rx="16" ry="22" fillOpacity={0.2} />
        <ellipse cx="178" cy="214" rx="16" ry="22" fillOpacity={0.2} />
        {/* Left biceps / upper arm */}
        <ellipse cx="106" cy="224" rx="11" ry="24" fillOpacity={0.22} />
        {/* Right biceps / upper arm */}
        <ellipse cx="214" cy="224" rx="11" ry="24" fillOpacity={0.22} />
        {/* Abs area outline */}
        <path
          d="M138 252 L182 252 L180 310 L140 310 Z"
          fill="none"
          strokeWidth={2}
          strokeOpacity={0.5}
          fillOpacity={0.08}
        />
        {Array.from({ length: 3 }).map((_, i) => (
          <line
            key={`ab${i}`}
            x1={142 + i * 13}
            y1={252}
            x2={142 + i * 13}
            y2={310}
            strokeWidth={1}
            strokeOpacity={0.3}
          />
        ))}
        {/* Left quadriceps */}
        <ellipse cx="136" cy="500" rx="16" ry="40" fillOpacity={0.22} />
        {/* Right quadriceps */}
        <ellipse cx="184" cy="500" rx="16" ry="40" fillOpacity={0.22} />
        {/* Left calf */}
        <ellipse cx="132" cy="610" rx="12" ry="28" fillOpacity={0.22} />
        {/* Right calf */}
        <ellipse cx="188" cy="610" rx="12" ry="28" fillOpacity={0.22} />
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

  const regionIds: RegionId[] = ['brain', 'eyes', 'heart', 'immune', 'gut', 'bones', 'muscles'];

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
    const svgX = ((e.clientX - rect.left) / rect.width) * 320;
    const svgY = ((e.clientY - rect.top) / rect.height) * 760;
    setTooltip({ x: svgX, y: svgY, id });
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        ref={svgRef}
        viewBox="0 0 320 760"
        className="w-full h-full"
        style={{ maxHeight: '85vh', filter: 'drop-shadow(0 0 20px rgba(34,211,238,0.06))' }}
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
          <radialGradient id="bodyGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Body silhouette - front view, 7.5 head-heights, centered at x=160 */}
        <g fill="url(#bodyFill)" stroke="url(#bodyStroke)" strokeWidth="1.5" strokeLinejoin="round">
          {/* Head */}
          <ellipse cx="160" cy="58" rx="44" ry="48" />
          {/* Neck */}
          <path d="M146 104 L146 120 L174 120 L174 104 Z" />
          {/* Torso: shoulders → taper to waist → pelvis */}
          <path d="M112 122 Q100 126 94 140 L84 200 Q80 230 86 250 L92 280 Q96 300 100 318 L104 392 Q108 406 112 414 L208 414 Q212 406 216 392 L220 318 Q224 300 228 280 L234 250 Q240 230 236 200 L226 140 Q220 126 208 122 Z" />
          {/* Left arm: shoulder → elbow → forearm → hand */}
          <path d="M94 140 Q70 150 60 180 L48 250 Q42 280 44 300 L52 348 Q48 360 50 368 L62 368 Q64 358 62 348 L68 320 L74 290 L82 220 Q86 190 94 160 Z" />
          {/* Right arm */}
          <path d="M226 140 Q250 150 260 180 L272 250 Q278 280 276 300 L268 348 Q264 360 266 368 L278 368 Q280 358 278 348 L272 320 L266 290 L258 220 Q254 190 246 160 Z" />
          {/* Left leg: hip → thigh → knee → shin → foot */}
          <path d="M112 414 Q100 430 96 460 L88 560 Q84 590 86 610 L90 670 Q88 686 92 696 L98 700 L108 696 Q110 686 112 676 L118 600 Q120 560 122 520 L126 470 Q128 440 130 420 Z" />
          {/* Right leg */}
          <path d="M208 414 Q220 430 224 460 L232 560 Q236 590 234 610 L230 670 Q232 686 228 696 L222 700 L212 696 Q210 686 208 676 L202 600 Q200 560 198 520 L194 470 Q192 440 190 420 Z" />
          {/* Feet */}
          <ellipse cx="98" cy="705" rx="12" ry="6" />
          <ellipse cx="222" cy="705" rx="12" ry="6" />
        </g>

        {/* Faint cyan glow overlay */}
        <ellipse cx="160" cy="380" rx="110" ry="340" fill="url(#bodyGlow)" />

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
        {/* Transparent hit area for easy clicking */}
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
  const { anchor, labelPos, labelSide, id } = region;
  const textAnchor = labelSide === 'left' ? 'start' : 'end';
  // Line goes from anchor point to a bend, then horizontally to label
  const bendX = labelSide === 'left' ? 60 : 260;

  return (
    <g opacity={dimmed ? 0.3 : 0.85} pointerEvents="none">
      <line
        x1={anchor.x}
        y1={anchor.y}
        x2={bendX}
        y2={labelPos.y}
        stroke={color}
        strokeWidth="0.75"
        strokeDasharray="2 2"
        opacity={0.5}
      />
      <line
        x1={bendX}
        y1={labelPos.y}
        x2={labelSide === 'left' ? labelPos.x + 38 : labelPos.x - 38}
        y2={labelPos.y}
        stroke={color}
        strokeWidth="0.75"
        strokeDasharray="2 2"
        opacity={0.5}
      />
      <circle cx={anchor.x} cy={anchor.y} r="2.5" fill={color} opacity={0.7} />
      <text
        x={labelPos.x}
        y={labelPos.y - 4}
        textAnchor={textAnchor}
        fill={color}
        fontSize="10"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
      >
        {REGION_NAMES[id]}
      </text>
      <text
        x={labelPos.x}
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
