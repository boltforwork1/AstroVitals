import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DailyRecord } from '@/types/health';
import type { RegionId } from '@/data/bodyRegions';
import type { HazardId } from '@/data/hazards';
import { getRegionStatus } from '@/utils/regionStatus';
import { statusColor } from '@/utils/status';

export type BodyLayer = 'organs' | 'skeleton' | 'muscles';

interface HumanBodyProps {
  record: DailyRecord;
  selectedRegion: RegionId | null;
  onSelectRegion: (id: RegionId) => void;
  activeHazard: HazardId | null;
  layer: BodyLayer;
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

const LAYER_REGIONS: Record<BodyLayer, RegionId[]> = {
  organs: ['brain', 'eyes', 'heart', 'immune', 'gut'],
  skeleton: ['bones'],
  muscles: ['muscles'],
};

// viewBox 320 x 800. Body centered at x=160, 7.5 head-heights (head ≈ 107).
const VB_W = 320;
const VB_H = 800;

// ============================================================
// ORGANS LAYER
// ============================================================
const organShapes: RegionShape[] = [
  {
    id: 'brain',
    anchor: { x: 160, y: 62 },
    labelPos: { x: 12, y: 55 },
    labelSide: 'left',
    hitArea: <rect x="106" y="14" width="108" height="80" rx="50" fill="transparent" />,
    shapes: (
      <>
        {/* Left hemisphere */}
        <path
          d="M158 20 C138 20 120 36 120 58 C120 72 126 82 134 88 L134 94 C134 98 138 100 142 100 L158 100 Z"
          fillOpacity={0.25}
        />
        {/* Right hemisphere */}
        <path
          d="M162 20 C182 20 200 36 200 58 C200 72 194 82 186 88 L186 94 C186 98 182 100 178 100 L162 100 Z"
          fillOpacity={0.25}
        />
        {/* Central fissure */}
        <line x1="160" y1="22" x2="160" y2="98" strokeOpacity={0.5} strokeWidth={1} />
        {/* Fold lines left */}
        <path d="M138 38 Q146 42 142 50 Q138 56 144 62 Q148 68 142 76" fill="none" strokeOpacity={0.4} strokeWidth={0.8} />
        {/* Fold lines right */}
        <path d="M182 38 Q174 42 178 50 Q182 56 176 62 Q172 68 178 76" fill="none" strokeOpacity={0.4} strokeWidth={0.8} />
        {/* Cerebellum */}
        <ellipse cx="160" cy="92" rx="16" ry="8" fillOpacity={0.18} />
      </>
    ),
  },
  {
    id: 'eyes',
    anchor: { x: 160, y: 118 },
    labelPos: { x: 308, y: 118 },
    labelSide: 'right',
    hitArea: <rect x="116" y="104" width="88" height="26" rx="13" fill="transparent" />,
    shapes: (
      <>
        {/* Almond eye shapes */}
        <path d="M130 118 Q142 110 154 118 Q142 126 130 118 Z" fillOpacity={0.25} />
        <path d="M166 118 Q178 110 190 118 Q178 126 166 118 Z" fillOpacity={0.25} />
        {/* Pupils */}
        <circle cx="142" cy="118" r="3" fillOpacity={0.7} stroke="none" />
        <circle cx="178" cy="118" r="3" fillOpacity={0.7} stroke="none" />
      </>
    ),
  },
  {
    id: 'heart',
    anchor: { x: 142, y: 230 },
    labelPos: { x: 12, y: 230 },
    labelSide: 'left',
    hitArea: <rect x="100" y="190" width="70" height="80" rx="35" fill="transparent" />,
    shapes: (
      <path
        d="M144 200 C128 182 100 190 100 216 C100 240 128 260 144 272 C160 260 188 240 188 216 C188 190 160 182 144 200 Z"
        fillOpacity={0.25}
      />
    ),
  },
  {
    id: 'immune',
    anchor: { x: 160, y: 210 },
    labelPos: { x: 308, y: 210 },
    labelSide: 'right',
    hitArea: <rect x="92" y="150" width="136" height="70" rx="35" fill="transparent" />,
    shapes: (
      <>
        {/* Thymus */}
        <path
          d="M150 170 L144 186 Q144 202 160 204 Q176 202 176 186 L170 170 Z"
          fillOpacity={0.25}
        />
        {/* Neck lymph nodes */}
        <circle cx="138" cy="142" r="5" fillOpacity={0.25} />
        <circle cx="182" cy="142" r="5" fillOpacity={0.25} />
        {/* Armpit lymph nodes */}
        <circle cx="110" cy="190" r="5" fillOpacity={0.25} />
        <circle cx="118" cy="198" r="4" fillOpacity={0.22} />
        <circle cx="210" cy="190" r="5" fillOpacity={0.25} />
        <circle cx="202" cy="198" r="4" fillOpacity={0.22} />
      </>
    ),
  },
  {
    id: 'gut',
    anchor: { x: 160, y: 360 },
    labelPos: { x: 12, y: 360 },
    labelSide: 'left',
    hitArea: <rect x="114" y="290" width="92" height="110" rx="46" fill="transparent" />,
    shapes: (
      <>
        {/* Stomach */}
        <path
          d="M132 292 Q118 298 120 314 Q122 328 140 326 Q150 322 150 310 Q150 296 132 292 Z"
          fillOpacity={0.25}
        />
        {/* Coiled intestine */}
        <path
          d="M128 332 Q114 332 114 348 Q114 364 132 364 Q150 364 150 348 Q150 332 168 332 Q186 332 186 348 Q186 364 202 364 Q210 364 210 348"
          fill="none" strokeWidth={4} fillOpacity={0} strokeOpacity={0.75}
        />
        <path
          d="M210 352 Q198 362 186 356 Q172 350 158 356 Q144 362 130 356 Q118 350 114 360"
          fill="none" strokeWidth={4} fillOpacity={0} strokeOpacity={0.75}
        />
        <path
          d="M114 368 Q126 376 138 370 Q150 364 162 370 Q174 376 186 370 Q198 364 210 372"
          fill="none" strokeWidth={3} fillOpacity={0} strokeOpacity={0.55}
        />
      </>
    ),
  },
];

// ============================================================
// SKELETON LAYER
// ============================================================
const skeletonShapes: RegionShape[] = [
  {
    id: 'bones',
    anchor: { x: 160, y: 400 },
    labelPos: { x: 12, y: 400 },
    labelSide: 'left',
    hitArea: <rect x="56" y="14" width="208" height="720" rx="40" fill="transparent" />,
    shapes: (
      <>
        {/* Skull with eye sockets and jaw */}
        <ellipse cx="160" cy="56" rx="40" ry="46" fillOpacity={0.12} />
        <ellipse cx="144" cy="56" rx="9" ry="11" fillOpacity={0.4} />
        <ellipse cx="176" cy="56" rx="9" ry="11" fillOpacity={0.4} />
        {/* Nasal cavity */}
        <path d="M160 70 L156 82 L160 86 L164 82 Z" fillOpacity={0.35} />
        {/* Jaw */}
        <path d="M134 88 Q160 100 186 88 Q186 96 160 98 Q134 96 134 88 Z" fillOpacity={0.15} />
        {/* Teeth marks */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`t${i}`} x1={140 + i * 8} y1={94} x2={140 + i * 8} y2={98} strokeWidth={0.6} strokeOpacity={0.5} />
        ))}

        {/* Clavicles */}
        <path d="M120 130 Q140 124 158 132" fill="none" strokeWidth={4} strokeOpacity={0.7} />
        <path d="M200 130 Q180 124 162 132" fill="none" strokeWidth={4} strokeOpacity={0.7} />

        {/* Sternum */}
        <rect x="155" y="150" width="10" height="56" rx="4" fillOpacity={0.2} />

        {/* Ribcage - 10 curved rib pairs */}
        {Array.from({ length: 10 }).map((_, i) => {
          const y = 148 + i * 12;
          const ribLen = 52 - Math.abs(i - 4) * 3;
          return (
            <g key={`rib${i}`}>
              <path d={`M160 ${y} Q${160 - ribLen} ${y + 6} ${160 - ribLen} ${y + 18}`} fill="none" strokeWidth={3} strokeOpacity={0.6} />
              <path d={`M160 ${y} Q${160 + ribLen} ${y + 6} ${160 + ribLen} ${y + 18}`} fill="none" strokeWidth={3} strokeOpacity={0.6} />
            </g>
          );
        })}

        {/* Spine - 24 vertebra blocks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const y = 136 + i * 14;
          const w = i < 7 ? 8 : 10;
          return <rect key={`vert${i}`} x={160 - w / 2} y={y} width={w} height={6} rx={2} fillOpacity={0.25} />;
        })}

        {/* Pelvis */}
        <path
          d="M114 440 Q104 452 108 470 Q112 486 130 488 L148 486 Q154 480 160 478 Q166 480 172 486 L190 488 Q208 486 212 470 Q216 452 206 440"
          fillOpacity={0.15} strokeWidth={3} strokeOpacity={0.6}
        />

        {/* Left arm: humerus, radius+ulna, hand */}
        <rect x="96" y="136" width="8" height="70" rx="3" transform="rotate(8 100 171)" fillOpacity={0.2} />
        <rect x="84" y="220" width="6" height="64" rx="3" transform="rotate(6 87 252)" fillOpacity={0.2} />
        <rect x="76" y="224" width="6" height="60" rx="3" transform="rotate(4 79 254)" fillOpacity={0.18} />
        {/* Left hand simplified */}
        <path d="M78 290 L70 300 L72 310 L80 306 L76 318 L84 314 L82 326 L90 320 L88 332 L94 326" fill="none" strokeWidth={2.5} strokeOpacity={0.5} />

        {/* Right arm: humerus, radius+ulna, hand */}
        <rect x="216" y="136" width="8" height="70" rx="3" transform="rotate(-8 220 171)" fillOpacity={0.2} />
        <rect x="230" y="220" width="6" height="64" rx="3" transform="rotate(-6 233 252)" fillOpacity={0.2} />
        <rect x="238" y="224" width="6" height="60" rx="3" transform="rotate(-4 241 254)" fillOpacity={0.18} />
        {/* Right hand simplified */}
        <path d="M242 290 L250 300 L248 310 L240 306 L244 318 L236 314 L238 326 L230 320 L232 332 L226 326" fill="none" strokeWidth={2.5} strokeOpacity={0.5} />

        {/* Left leg: femur, patella, tibia+fibula, foot */}
        <rect x="128" y="480" width="10" height="100" rx="4" fillOpacity={0.2} />
        <circle cx="133" cy="584" r="7" fillOpacity={0.25} />
        <rect x="128" y="592" width="8" height="90" rx="3" fillOpacity={0.2} />
        <rect x="138" y="594" width="5" height="86" rx="2" fillOpacity={0.15} />
        {/* Left foot */}
        <path d="M124 686 L112 696 L108 702 L120 700 L134 696 L134 688 Z" fillOpacity={0.18} strokeWidth={2.5} strokeOpacity={0.5} />

        {/* Right leg: femur, patella, tibia+fibula, foot */}
        <rect x="182" y="480" width="10" height="100" rx="4" fillOpacity={0.2} />
        <circle cx="187" cy="584" r="7" fillOpacity={0.25} />
        <rect x="184" y="592" width="8" height="90" rx="3" fillOpacity={0.2} />
        <rect x="177" y="594" width="5" height="86" rx="2" fillOpacity={0.15} />
        {/* Right foot */}
        <path d="M196 686 L208 696 L212 702 L200 700 L186 696 L186 688 Z" fillOpacity={0.18} strokeWidth={2.5} strokeOpacity={0.5} />

        {/* Joint circles: shoulders, elbows, wrists, hips, knees, ankles */}
        {[
          [108, 136], [100, 210], [90, 286],
          [212, 136], [220, 210], [230, 286],
          [133, 480], [133, 584], [130, 686],
          [187, 480], [187, 584], [190, 686],
        ].map(([cx, cy], i) => (
          <circle key={`sj${i}`} cx={cx} cy={cy} r={5} fillOpacity={0.3} strokeOpacity={0.6} strokeWidth={2} />
        ))}
      </>
    ),
  },
];

// ============================================================
// MUSCLES LAYER
// ============================================================
const muscleShapes: RegionShape[] = [
  {
    id: 'muscles',
    anchor: { x: 160, y: 380 },
    labelPos: { x: 12, y: 380 },
    labelSide: 'left',
    hitArea: <rect x="64" y="130" width="192" height="560" rx="40" fill="transparent" />,
    shapes: (
      <>
        {/* Deltoids */}
        <path d="M108 138 Q96 148 96 164 Q100 170 108 166 L114 150 Z" fillOpacity={0.22} />
        <path d="M212 138 Q224 148 224 164 Q220 170 212 166 L206 150 Z" fillOpacity={0.22} />

        {/* Pectorals */}
        <path d="M130 160 Q124 170 126 186 Q134 196 148 194 L152 170 Q146 162 130 160 Z" fillOpacity={0.22} />
        <path d="M190 160 Q196 170 194 186 Q186 196 172 194 L168 170 Q174 162 190 160 Z" fillOpacity={0.22} />
        {/* Pec fiber lines */}
        <path d="M134 168 Q140 176 146 188" fill="none" strokeWidth={0.6} strokeOpacity={0.4} />
        <path d="M186 168 Q180 176 174 188" fill="none" strokeWidth={0.6} strokeOpacity={0.4} />

        {/* Biceps */}
        <path d="M100 172 Q94 188 96 210 Q104 216 110 210 L114 180 Q110 172 100 172 Z" fillOpacity={0.22} />
        <path d="M220 172 Q226 188 224 210 Q216 216 210 210 L206 180 Q210 172 220 172 Z" fillOpacity={0.22} />
        {/* Bicep fiber lines */}
        <line x1="103" y1="180" x2="106" y2="206" strokeWidth={0.6} strokeOpacity={0.4} />
        <line x1="217" y1="180" x2="214" y2="206" strokeWidth={0.6} strokeOpacity={0.4} />

        {/* Triceps (back of arm, shown as slight bulge on outer side) */}
        <path d="M88 180 Q84 196 86 216 Q92 220 96 214 L98 186 Q94 180 88 180 Z" fillOpacity={0.18} />
        <path d="M232 180 Q236 196 234 216 Q228 220 224 214 L222 186 Q226 180 232 180 Z" fillOpacity={0.18} />

        {/* Forearms */}
        <path d="M86 226 Q80 246 82 272 Q90 278 96 272 L98 232 Q94 226 86 226 Z" fillOpacity={0.22} />
        <path d="M234 226 Q240 246 238 272 Q230 278 224 272 L222 232 Q226 226 234 226 Z" fillOpacity={0.22} />

        {/* Abdominal block - six-pack segments */}
        <path d="M134 200 L186 200 L182 280 L138 280 Z" fillOpacity={0.12} strokeWidth={1.5} strokeOpacity={0.4} />
        {/* Six-pack */}
        {Array.from({ length: 3 }).map((_, row) => {
          const y0 = 208 + row * 24;
          return (
            <g key={`ab${row}`}>
              <line x1="160" y1={y0} x2="160" y2={y0 + 20} strokeWidth={1} strokeOpacity={0.4} />
              <line x1="134" y1={y0 + 10} x2="186" y2={y0 + 10} strokeWidth={1} strokeOpacity={0.3} />
            </g>
          );
        })}

        {/* Obliques */}
        <path d="M130 202 Q122 220 124 250 Q130 268 136 272 L138 210 Q134 204 130 202 Z" fillOpacity={0.18} />
        <path d="M190 202 Q198 220 196 250 Q190 268 184 272 L182 210 Q186 204 190 202 Z" fillOpacity={0.18} />

        {/* Quadriceps */}
        <path d="M122 480 Q114 500 116 540 Q124 556 138 552 L142 496 Q136 482 122 480 Z" fillOpacity={0.22} />
        <path d="M198 480 Q206 500 204 540 Q196 556 182 552 L178 496 Q184 482 198 480 Z" fillOpacity={0.22} />
        {/* Quad fiber lines */}
        <line x1="128" y1="494" x2="132" y2="544" strokeWidth={0.6} strokeOpacity={0.4} />
        <line x1="192" y1="494" x2="188" y2="544" strokeWidth={0.6} strokeOpacity={0.4} />

        {/* Hamstrings outline (behind thigh, suggested on inner edge) */}
        <path d="M142 486 Q146 510 144 548 Q140 556 136 552 L138 494 Q140 488 142 486 Z" fillOpacity={0.15} />
        <path d="M178 486 Q174 510 176 548 Q180 556 184 552 L182 494 Q180 488 178 486 Z" fillOpacity={0.15} />

        {/* Calves */}
        <path d="M120 600 Q112 620 114 650 Q122 666 134 660 L138 610 Q132 600 120 600 Z" fillOpacity={0.22} />
        <path d="M200 600 Q208 620 206 650 Q198 666 186 660 L182 610 Q188 600 200 600 Z" fillOpacity={0.22} />
        {/* Calf fiber lines */}
        <line x1="126" y1="612" x2="128" y2="652" strokeWidth={0.6} strokeOpacity={0.4} />
        <line x1="194" y1="612" x2="192" y2="652" strokeWidth={0.6} strokeOpacity={0.4} />
      </>
    ),
  },
];

const LAYER_SHAPES: Record<BodyLayer, RegionShape[]> = {
  organs: organShapes,
  skeleton: skeletonShapes,
  muscles: muscleShapes,
};

// ============================================================
// BODY SILHOUETTE - single smooth path
// ============================================================
const BODY_PATH = `
  M 160 14
  C 188 14 208 34 208 60
  C 208 82 196 98 180 104
  L 180 112
  C 180 116 176 120 172 120
  L 148 120
  C 144 120 140 116 140 112
  L 140 104
  C 124 98 112 82 112 60
  C 112 34 132 14 160 14
  Z
  M 148 120
  L 110 126
  C 98 130 88 142 84 160
  L 72 220
  C 68 250 70 270 76 286
  L 82 300
  C 86 310 88 324 90 340
  L 92 420
  C 92 440 96 452 104 460
  L 100 470
  C 92 480 86 496 82 520
  L 74 580
  C 70 610 70 640 74 668
  L 78 708
  C 78 722 82 736 88 746
  L 100 752
  C 106 750 110 744 112 736
  L 116 700
  C 118 670 120 640 122 610
  L 126 520
  C 128 490 130 468 132 456
  L 188 456
  C 190 468 192 490 194 520
  L 198 610
  C 200 640 202 670 204 700
  L 208 736
  C 210 744 214 750 220 752
  L 232 746
  C 238 736 242 722 242 708
  L 246 668
  C 250 640 250 610 246 580
  L 238 520
  C 234 496 228 480 220 470
  L 216 460
  C 224 452 228 440 228 420
  L 230 340
  C 232 324 234 310 238 300
  L 244 286
  C 250 270 252 250 248 220
  L 236 160
  C 232 142 222 130 210 126
  L 172 120
`;

export default function HumanBody({
  record,
  selectedRegion,
  onSelectRegion,
  activeHazard,
  layer,
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

  const activeShapes = LAYER_SHAPES[layer];
  const activeRegionIds = LAYER_REGIONS[layer];

  const regions = activeShapes.map((r) => {
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
        style={{ maxHeight: '80vh', filter: 'drop-shadow(0 0 20px rgba(34,211,238,0.06))' }}
      >
        <defs>
          <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F1626" />
            <stop offset="100%" stopColor="#0A1020" />
          </linearGradient>
          <radialGradient id="bodyGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Body silhouette - single smooth path */}
        <path
          d={BODY_PATH}
          fill="url(#bodyFill)"
          stroke="#22D3EE"
          strokeWidth="1.2"
          strokeOpacity="0.35"
          strokeLinejoin="round"
        />

        {/* Faint cyan glow overlay */}
        <ellipse cx="160" cy="400" rx="100" ry="380" fill="url(#bodyGlow)" />

        {/* Layer regions with cross-fade */}
        <AnimatePresence mode="wait">
          <motion.g
            key={layer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
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
          </motion.g>
        </AnimatePresence>

        {/* Legend (always visible, bottom of SVG) */}
        {showLabels && <Legend />}
      </svg>

      {/* Floating tooltip */}
      {tooltip && hoveredRegion && activeRegionIds.includes(hoveredRegion) && (
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
          statusLabel={STATUS_LABEL[region.status.status]}
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
  statusLabel,
}: {
  region: RegionShape;
  color: string;
  dimmed: boolean;
  statusScore: number;
  statusLabel: string;
}) {
  const { anchor, labelPos, labelSide, id } = region;
  const textAnchor = labelSide === 'left' ? 'start' : 'end';
  const bendX = labelSide === 'left' ? 55 : 265;
  const labelEndX = labelSide === 'left' ? labelPos.x + 42 : labelPos.x - 42;

  return (
    <g opacity={dimmed ? 0.3 : 0.85} pointerEvents="none">
      <line x1={anchor.x} y1={anchor.y} x2={bendX} y2={labelPos.y} stroke={color} strokeWidth="0.75" strokeDasharray="2 2" opacity={0.5} />
      <line x1={bendX} y1={labelPos.y} x2={labelEndX} y2={labelPos.y} stroke={color} strokeWidth="0.75" strokeDasharray="2 2" opacity={0.5} />
      <circle cx={anchor.x} cy={anchor.y} r="2.5" fill={color} opacity={0.7} />
      <text x={labelPos.x} y={labelPos.y - 6} textAnchor={textAnchor} fill={color} fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">
        {REGION_NAMES[id]}
      </text>
      <text x={labelPos.x} y={labelPos.y + 6} textAnchor={textAnchor} fill="#8A97B5" fontSize="9" fontFamily="Inter, sans-serif">
        {statusScore}/100 · {statusLabel}
      </text>
    </g>
  );
}

// --- Legend ---
function Legend() {
  const items: { label: string; color: string }[] = [
    { label: 'Normal', color: '#22C55E' },
    { label: 'Caution', color: '#F59E0B' },
    { label: 'Critical', color: '#EF4444' },
  ];

  return (
    <g transform={`translate(${VB_W / 2 - 90}, ${VB_H - 24})`} pointerEvents="none">
      {items.map((item, i) => (
        <g key={item.label} transform={`translate(${i * 62}, 0)`}>
          <circle cx="6" cy="0" r="4" fill={item.color} opacity={0.8} />
          <text x="14" y="3" fill="#8A97B5" fontSize="9" fontFamily="Inter, sans-serif">
            {item.label}
          </text>
        </g>
      ))}
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
      style={{ left: '50%', top: '14%', transform: 'translateX(-50%)' }}
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
