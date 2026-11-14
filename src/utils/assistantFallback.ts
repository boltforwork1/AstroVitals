import type { DailyRecord, IndicatorKey } from '@/types/health';
import type { AlertState } from '@/types/alerts';
import { indicators } from '@/data/indicators';
import { calculateHealthScore, getScoreLabel } from './score';
import { getStatus } from './status';
import { getTrend } from './trend';

const DISCLAIMER = 'Decision support only, not a medical diagnosis.';

const EMERGENCY_WORDS = [
  'chest pain', "can't breathe", 'cannot breathe', 'faint', 'fainted', 'unconscious',
  'bleeding heavily', 'suicide', 'self-harm', 'want to die', 'heart attack', 'stroke',
];

export function isEmergency(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGENCY_WORDS.some((w) => lower.includes(w));
}

const has = (text: string, ...words: string[]) => {
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w));
};

const latest = (records: DailyRecord[], key: IndicatorKey) => records[records.length - 1][key];

export function getFallbackReply(text: string, records: DailyRecord[], alerts: AlertState[]): string {
  const l = records[records.length - 1];

  if (isEmergency(text)) {
    return (
      'This may be urgent. Follow mission emergency procedures and contact the flight surgeon or ground support immediately.\n' +
      'Do not wait — in space, a problem can escalate quickly and communication delay may be significant.\n' +
      DISCLAIMER
    );
  }

  if (has(text, 'sleep', 'rest')) {
    const v = latest(records, 'sleep');
    const status = getStatus('sleep', v);
    const trend = getTrend(records, 'sleep');
    const trendStr = trend.direction === 'flat' ? 'stable' : `${trend.direction} ${trend.percent}%`;
    return (
      `Your latest sleep is ${v} hours, rated as ${status}. The 7-day trend is ${trendStr}. ` +
      'The normal target is 7-9 hours. The ISS orbits every 90 minutes, creating 16 day-night cycles per day, which disrupts your body clock.\n' +
      'Try these:\n- Keep a fixed sleep window, same bedtime and wake time\n- Dim cabin lights 1 hour before sleep\n- Avoid heavy exercise right before rest\n' +
      DISCLAIMER
    );
  }

  if (has(text, 'heart', 'pulse', 'cardiac', 'heart rate')) {
    const v = latest(records, 'heartRate');
    const status = getStatus('heartRate', v);
    const trend = getTrend(records, 'heartRate');
    const trendStr = trend.direction === 'flat' ? 'stable' : `${trend.direction} ${trend.percent}%`;
    return (
      `Your resting heart rate is ${v} bpm, rated as ${status}. The 7-day trend is ${trendStr}. Normal range is 60-100 bpm. ` +
      'In microgravity, blood shifts toward the upper body, which can gradually raise resting heart rate over weeks.\n' +
      'Stay hydrated, avoid caffeine before rest, and try 5 minutes of slow breathing. If it keeps climbing, report it to the flight surgeon.\n' +
      DISCLAIMER
    );
  }

  if (has(text, 'blood pressure', 'bp', 'hypertension', 'systolic', 'diastolic')) {
    const sys = latest(records, 'systolic');
    const dia = latest(records, 'diastolic');
    const sysStatus = getStatus('systolic', sys);
    return (
      `Your blood pressure is ${sys}/${dia} mmHg. Systolic is rated as ${sysStatus}. Normal ranges are 90-120 systolic and 60-80 diastolic. ` +
      'Fluid shifts toward the head in microgravity, and the cardiovascular system adapts over time.\n' +
      'Recheck after 5 minutes of seated rest. Cut back on salt, hydrate well, and report dizziness to the flight surgeon.\n' +
      DISCLAIMER
    );
  }

  if (has(text, 'bone', 'exercise', 'muscle', 'training', 'workout', 'resistance')) {
    const v = latest(records, 'exercise');
    const status = getStatus('exercise', v);
    return (
      `You logged ${v} minutes of exercise today, rated as ${status}. The daily target is 120-180 minutes. ` +
      'Without gravity loading, bones lose about 1% density per month in weight-bearing areas, and postural muscles shrink within days.\n' +
      'Prioritise resistance exercise (squats, deadlifts) for bone loading, plus treadmill or cycle for heart health. Log every session so totals are accurate.\n' +
      DISCLAIMER
    );
  }

  if (has(text, 'radiation', 'dose', 'cosmic', 'solar', 'storm')) {
    const total = records.reduce((s, r) => s + r.radiationDose, 0);
    const today = l.radiationDose;
    return (
      `Your cumulative radiation dose so far is ${Math.round(total * 100) / 100} mSv. Today's dose was ${today} mSv. ` +
      "The demo career limit is 600 mSv. In low Earth orbit the station hull and Earth's magnetic field provide shielding, but cosmic rays and solar particles still pass through.\n" +
      'Limit time outside the hull, use the storm shelter during solar particle events, and track your dosimeter daily.\n' +
      DISCLAIMER
    );
  }

  if (has(text, 'stress', 'mood', 'anxious', 'anxiety', 'lonely', 'loneliness', 'isolat', 'mental', 'sad', 'down')) {
    const v = latest(records, 'mood');
    const trend = getTrend(records, 'mood');
    const trendStr = trend.direction === 'flat' ? 'stable' : `${trend.direction} ${trend.percent}%`;
    return (
      `Your mood is ${v}/5. The 7-day trend is ${trendStr}. Isolation and confinement are recognised spaceflight hazards that affect mood and teamwork over time.\n` +
      'Try a 5-minute plan:\n- 2 minutes of slow box breathing (inhale 4s, hold 4s, exhale 4s, hold 4s)\n- 2 minutes naming things you can see, touch, and hear\n- 1 minute reaching out to a crew member or ground support\n' +
      DISCLAIMER
    );
  }

  if (has(text, 'dizzy', 'lightheaded', 'vertigo')) {
    return (
      'Dizziness in space can be caused by fluid shifts, low blood pressure, or dehydration. Recheck blood pressure after 5 minutes of seated rest. Hydrate well and avoid sudden movements.\n' +
      'If dizziness persists or you feel faint, report it to the flight surgeon.\n' +
      DISCLAIMER
    );
  }

  // Default
  const score = calculateHealthScore(l);
  const { label } = getScoreLabel(score);
  const criticalAlerts = alerts.filter((a) => a.level === 'critical');
  let reply = `Your overall health score is ${score}/100 (${label}). `;
  if (criticalAlerts.length > 0) {
    reply += `You have ${criticalAlerts.length} critical alert${criticalAlerts.length === 1 ? '' : 's'} that may need attention. `;
  }
  reply += 'You can ask me about sleep, heart rate, blood pressure, exercise, radiation, mood, or any health concern.\n';
  reply += DISCLAIMER;
  return reply;
}
