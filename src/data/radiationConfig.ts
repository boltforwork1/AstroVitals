// All values in this file are illustrative demo numbers, to be verified against NASA HRP sources.
import type { Status } from '@/types/health';

export const CAREER_LIMIT_MSV = 600;
export const CAREER_LIMIT_LABEL = 'Career limit used for this demo';

export type EnvironmentId = 'leo' | 'transit' | 'moon' | 'mars';

export interface RadiationEnvironment {
  id: EnvironmentId;
  label: string;
  doseRateMsvPerDay: number;
  description: string;
}

export const RADIATION_ENVIRONMENTS: RadiationEnvironment[] = [
  {
    id: 'leo',
    label: 'Low Earth orbit (ISS)',
    doseRateMsvPerDay: 0.6,
    description: 'Shielded by Earth magnetic field and the station hull. The lowest exposure of the four.',
  },
  {
    id: 'transit',
    label: 'Deep space transit',
    doseRateMsvPerDay: 1.8,
    description: 'Outside Earth magnetic protection, exposed to galactic cosmic rays for months.',
  },
  {
    id: 'moon',
    label: 'Lunar surface',
    doseRateMsvPerDay: 1.4,
    description: 'No atmosphere or magnetic field. Exposure comes from the surface and solar events.',
  },
  {
    id: 'mars',
    label: 'Mars surface',
    doseRateMsvPerDay: 0.7,
    description: 'A thin atmosphere offers some shielding, but cosmic rays still reach the surface.',
  },
];

export type StormLevel = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

export const STORM_LEVEL_ORDER: StormLevel[] = ['S1', 'S2', 'S3', 'S4', 'S5'];

export interface StormLevelInfo {
  label: string;
  description: string;
  extraDoseMsv: number;
  status: Status;
}

export const STORM_LEVELS: Record<StormLevel, StormLevelInfo> = {
  S1: {
    label: 'Minor',
    description: 'Few effects beyond polar routes. Routine precautions only.',
    extraDoseMsv: 0.2,
    status: 'caution',
  },
  S2: {
    label: 'Moderate',
    description: 'Some exposure risk for exposed work. Shelter for outside activities.',
    extraDoseMsv: 0.6,
    status: 'caution',
  },
  S3: {
    label: 'Strong',
    description: 'Elevated exposure in orbit. Shelter and limit any spacewalks.',
    extraDoseMsv: 1.5,
    status: 'caution',
  },
  S4: {
    label: 'Severe',
    description: 'Significant exposure risk. Shelter and pause all exposed activities.',
    extraDoseMsv: 4,
    status: 'critical',
  },
  S5: {
    label: 'Extreme',
    description: 'Major exposure event. Full shelter and close coordination with ground control.',
    extraDoseMsv: 10,
    status: 'critical',
  },
};

export const SHELTER_DOSE_REDUCTION = 0.6;
export const WARNING_DURATION_MS = 6000;
export const SHELTER_DURATION_MS = 12000;

export const SHELTER_CHECKLIST: { id: string; label: string }[] = [
  { id: 'move', label: 'Move to the storm shelter / most shielded area' },
  { id: 'headcount', label: 'Gather crew and confirm headcount' },
  { id: 'pause', label: 'Pause non-essential outside or exposed activities' },
  { id: 'ground', label: 'Confirm contact with ground control' },
  { id: 'dosimeter', label: 'Monitor the dosimeter' },
];

export interface DoseZone {
  id: 'green' | 'amber' | 'red';
  label: string;
  status: Status;
}

export const DOSE_ZONES: Record<DoseZone['id'], DoseZone> = {
  green: { id: 'green', label: 'Below 50% of limit', status: 'normal' },
  amber: { id: 'amber', label: '50% to 80% of limit', status: 'caution' },
  red: { id: 'red', label: 'Above 80% of limit', status: 'critical' },
};

export function doseZoneFor(percentOfLimit: number): DoseZone {
  if (percentOfLimit < 50) return DOSE_ZONES.green;
  if (percentOfLimit <= 80) return DOSE_ZONES.amber;
  return DOSE_ZONES.red;
}
