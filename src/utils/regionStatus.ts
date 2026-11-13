import type { DailyRecord, IndicatorKey, Status } from '@/types/health';
import { scoreForIndicator } from './score';
import { getStatus } from './status';
import type { RegionId } from '@/data/bodyRegions';
import { regionMap } from '@/data/bodyRegions';

export interface RelatedIndicatorInfo {
  key: IndicatorKey;
  value: number;
  status: Status;
  score: number;
}

export interface RegionStatusResult {
  score: number;
  status: Status;
  worstIndicator: IndicatorKey;
  indicators: RelatedIndicatorInfo[];
}

export function getRegionStatus(regionId: RegionId, record: DailyRecord): RegionStatusResult {
  const region = regionMap[regionId];
  const indicators: RelatedIndicatorInfo[] = region.relatedIndicators.map((key) => {
    const value = record[key];
    return {
      key,
      value,
      status: getStatus(key, value),
      score: scoreForIndicator(key, value),
    };
  });

  const score = Math.round(
    indicators.reduce((sum, ind) => sum + ind.score, 0) / indicators.length
  );

  let status: Status;
  if (score >= 80) status = 'normal';
  else if (score >= 55) status = 'caution';
  else status = 'critical';

  const worstIndicator = indicators.reduce((worst, ind) =>
    ind.score < worst.score ? ind : worst
  ).key;

  return { score, status, worstIndicator, indicators };
}
