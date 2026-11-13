import type { CrewMember, DailyRecord } from '@/types/health';

export const crewMember: CrewMember = {
  name: 'Cdr. Alex Rivera',
  role: 'Commander',
  missionLength: 180,
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

const START_DATE = new Date('2026-09-27T00:00:00Z');

export const mockRecords: DailyRecord[] = (() => {
  const rand = seededRandom(42);
  const days = 47;
  const records: DailyRecord[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(START_DATE);
    date.setUTCDate(date.getUTCDate() + i);
    const missionDay = i + 1;

    // Slow drifts over the mission
    const drift = i / days; // 0 → 1

    // Resting heart rate: starts ~68, slowly rises to ~75
    const heartRate = Math.round(clamp(68 + drift * 7 + (rand() - 0.5) * 6, 55, 115));

    // Systolic: starts ~112, slight rise to ~120
    const systolic = Math.round(clamp(112 + drift * 8 + (rand() - 0.5) * 8, 75, 145));

    // Diastolic: starts ~72, slight rise to ~78
    const diastolic = Math.round(clamp(72 + drift * 6 + (rand() - 0.5) * 6, 45, 95));

    // Glucose: stable ~85 with noise
    const glucose = Math.round(clamp(85 + (rand() - 0.5) * 12, 55, 130));

    // Temperature: stable ~36.6 with minor noise
    const temperature = round(clamp(36.6 + (rand() - 0.5) * 0.4, 35.0, 38.5), 1);

    // Sleep: starts ~8.0, slowly decreases to ~6.5
    const sleep = round(clamp(8.0 - drift * 1.5 + (rand() - 0.5) * 0.8, 4.0, 11.0), 1);

    // Mood: starts ~4.2, slight decline to ~3.6
    const mood = round(clamp(4.2 - drift * 0.6 + (rand() - 0.5) * 0.4, 1, 5), 1);

    // Exercise: stays around 150 with some daily variation
    const exercise = Math.round(clamp(150 + (rand() - 0.5) * 40, 40, 260));

    // Radiation dose: 0.5–0.7 mSv per day
    const radiationDose = round(clamp(0.5 + rand() * 0.2, 0.4, 0.8), 2);

    records.push({
      date: date.toISOString().slice(0, 10),
      missionDay,
      heartRate,
      systolic,
      diastolic,
      glucose,
      temperature,
      sleep,
      mood,
      exercise,
      radiationDose,
    });
  }

  // --- Override last 12 days (indices 35-46, mission days 36-47) ---
  // Drift sleep down to ~5.8 (caution), exercise down to ~50 (critical),
  // mood down to ~3.0 (caution), heart rate up to ~90 (still normal).
  // BP, glucose, temperature stay in normal range.
  const overrideStart = 35;
  const overrideCount = 12;
  for (let j = 0; j < overrideCount; j++) {
    const idx = overrideStart + j;
    const rec = records[idx];
    const t = j / (overrideCount - 1); // 0 → 1 over the 12 days

    // Sleep: 7.0 → 5.8 (caution by end)
    rec.sleep = round(7.0 - t * 1.2 + (rand() - 0.5) * 0.3, 1);

    // Exercise: 130 → 50, with final 3 days at 48-50 (critical, below 60)
    if (j < 9) {
      rec.exercise = Math.round(130 - t * 75 + (rand() - 0.5) * 10);
    } else {
      rec.exercise = Math.round(48 + rand() * 4); // 48-52
    }

    // Mood: 3.8 → 3.0 (caution by end)
    rec.mood = round(3.8 - t * 0.8 + (rand() - 0.5) * 0.2, 1);

    // Heart rate: 80 → 90 (still normal, 60-100)
    rec.heartRate = Math.round(80 + t * 10 + (rand() - 0.5) * 3);

    // Keep BP, glucose, temperature in normal range with slight noise
    rec.systolic = Math.round(116 + (rand() - 0.5) * 6);
    rec.diastolic = Math.round(74 + (rand() - 0.5) * 4);
    rec.glucose = Math.round(85 + (rand() - 0.5) * 8);
    rec.temperature = round(36.6 + (rand() - 0.5) * 0.3, 1);

    // Radiation dose stays in normal range
    rec.radiationDose = round(0.5 + rand() * 0.2, 2);
  }

  return records;
})();
