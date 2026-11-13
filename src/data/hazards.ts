export type HazardId = 'radiation' | 'isolation' | 'distance' | 'gravity' | 'closedEnvironment';

export interface Hazard {
  id: HazardId;
  label: string;
  description: string;
  color: string;
}

export const hazards: Hazard[] = [
  {
    id: 'radiation',
    label: 'Space Radiation',
    description: 'Cosmic rays and solar particles pass through the hull, raising long-term cancer and cellular damage risk.',
    color: '#22D3EE',
  },
  {
    id: 'isolation',
    label: 'Isolation & Confinement',
    description: 'Living in a small habitat with a tiny crew far from family strains mental health and team dynamics.',
    color: '#A78BFA',
  },
  {
    id: 'distance',
    label: 'Distance from Earth',
    description: 'As the spacecraft moves farther from home, resupply and emergency return become harder or impossible.',
    color: '#F59E0B',
  },
  {
    id: 'gravity',
    label: 'Altered Gravity',
    description: 'Microgravity removes mechanical loading from bones and muscles and shifts fluids toward the upper body.',
    color: '#22C55E',
  },
  {
    id: 'closedEnvironment',
    label: 'Hostile / Closed Environments',
    description: 'Recycled air, water, and limited food variety in a sealed habitat stress the immune system and metabolism.',
    color: '#EF4444',
  },
];
