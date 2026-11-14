// Gamification engine.
//
// Design principles:
// - XP rewards logging and effort, never health values (so nobody is tempted to
//   fake readings to score points).
// - Exercise XP is capped at 100% of the target: no reward for overtraining.
// - Streaks forgive one missed day per rolling 7-day window (a planned rest day
//   does not destroy a streak).
// - Everything is computed from existing data; no gamification events are stored.
import type { DailyRecord } from '@/types/health';
import type { JournalEntry, PulseResult, SessionRecord } from '@/context/WellbeingContext';
import type { StormEvent } from '@/context/StormContext';
import {
  BADGES,
  DAILY_MISSIONS,
  EXERCISE_80_MIN,
  EXERCISE_TARGET_MIN,
  LEVELS,
  MIND_SESSIONS_PER_DAY,
  WEEKLY_CHALLENGES,
  XP_RULES,
  type BadgeDef,
  type LevelDef,
} from '@/data/gamificationConfig';

export interface WellbeingData {
  sessions: SessionRecord[];
  journalEntries: JournalEntry[];
  pulseResults: PulseResult[];
}

export interface StormData {
  history: StormEvent[];
}

export interface XpBreakdown {
  checkIn: number;
  exerciseReached80: number;
  exerciseReached100: number;
  mindSession: number;
  weeklyPulse: number;
  journalEntry: number;
  stormSheltered: number;
  badgeBonuses: number;
}

export interface BadgeStatus {
  def: BadgeDef;
  status: 'locked' | 'unlocked';
  progress: { current: number; target: number };
  unlockedMissionDay?: number;
}

export interface TodayMission {
  id: string;
  label: string;
  xp: number;
  done: boolean;
  progress: number;
}

export interface WeeklyChallenge {
  id: string;
  label: string;
  rewardLabel: string;
  current: number;
  target: number;
  done: boolean;
}

export interface LastSevenDay {
  missionDay: number;
  checkedIn: boolean;
  exercisePercent: number;
  mindSessions: number;
}

export interface GamificationResult {
  xpBreakdown: XpBreakdown;
  totalXp: number;
  level: LevelDef;
  nextLevel: LevelDef | null;
  progressPercent: number;
  xpToNext: number;
  streaks: {
    checkInStreak: number;
    checkInBest: number;
    exerciseStreak: number;
    exerciseBest: number;
    restDayUsed: boolean;
  };
  badges: BadgeStatus[];
  todayMissions: TodayMission[];
  weeklyChallenges: WeeklyChallenge[];
  lastSevenDays: LastSevenDay[];
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function forgivingStreaks(
  present: Set<number>,
  latestDay: number
): { current: number; best: number; restDayUsed: boolean } {
  // Forward scan for the best streak.
  let best = 0;
  let run = 0;
  let forgiven: number[] = [];
  for (let day = 1; day <= latestDay; day++) {
    if (present.has(day)) {
      run++;
    } else if (run > 0) {
      const recentForgiven = forgiven.some((d) => day - d < 7);
      if (recentForgiven) {
        run = 0;
        forgiven = [];
      } else {
        forgiven.push(day);
      }
    }
    best = Math.max(best, run);
  }

  // Backward scan from the latest day for the current streak.
  let current = 0;
  let restDayUsed = false;
  const currentForgiven: number[] = [];
  for (let day = latestDay; day >= 1; day--) {
    if (present.has(day)) {
      current++;
    } else if (current > 0) {
      const recentForgiven = currentForgiven.some((d) => d - day < 7);
      if (recentForgiven) break;
      currentForgiven.push(day);
      restDayUsed = true;
    }
  }

  return { current, best: Math.max(best, current), restDayUsed };
}

function countCrossings<T extends { missionDay: number }>(
  records: T[],
  perDayValue: (r: T) => number,
  threshold: number
): { total: number; dayReached: number | null } {
  let total = 0;
  let dayReached: number | null = null;
  for (const r of records) {
    total += perDayValue(r);
    if (dayReached === null && total >= threshold) dayReached = r.missionDay;
  }
  return { total, dayReached };
}

// Longest forgiving streak ending at or before each record day; returns the
// mission day on which the streak first reached `target`.
function dayStreakReached(records: DailyRecord[], present: Set<number>, target: number): number | null {
  const latestDay = records[records.length - 1]?.missionDay ?? 0;
  const { best } = forgivingStreaks(present, latestDay);
  if (best < target) return null;
  let run = 0;
  let forgiven: number[] = [];
  for (let day = 1; day <= latestDay; day++) {
    if (present.has(day)) {
      run++;
      if (run >= target) return day;
    } else if (run > 0) {
      const recentForgiven = forgiven.some((d) => day - d < 7);
      if (recentForgiven) {
        run = 0;
        forgiven = [];
      } else {
        forgiven.push(day);
      }
    }
  }
  return null;
}

export function computeGamification(
  records: DailyRecord[],
  wellbeing: WellbeingData,
  storms: StormData
): GamificationResult {
  const safeRecords = Array.isArray(records) ? records : [];
  const sessions = Array.isArray(wellbeing?.sessions) ? wellbeing.sessions : [];
  const journalEntries = Array.isArray(wellbeing?.journalEntries) ? wellbeing.journalEntries : [];
  const pulseResults = Array.isArray(wellbeing?.pulseResults) ? wellbeing.pulseResults : [];
  const stormHistory = Array.isArray(storms?.history) ? storms.history : [];

  const latest = safeRecords[safeRecords.length - 1];
  const latestDay = latest?.missionDay ?? 0;

  // --- XP breakdown ---------------------------------------------------------
  const daysAt80 = safeRecords.filter((r) => r.exercise >= EXERCISE_80_MIN).length;
  const daysAt100 = safeRecords.filter((r) => r.exercise >= EXERCISE_TARGET_MIN).length;

  const mindByDay = new Map<number, number>();
  sessions.forEach((s) => {
    if (typeof s?.missionDay !== 'number') return;
    mindByDay.set(s.missionDay, (mindByDay.get(s.missionDay) ?? 0) + 1);
  });
  const countableMind = Array.from(mindByDay.values()).reduce(
    (sum, n) => sum + Math.min(n, MIND_SESSIONS_PER_DAY),
    0
  );

  const journalByDay = new Set<number>();
  journalEntries.forEach((j) => {
    if (typeof j?.missionDay === 'number') journalByDay.add(j.missionDay);
  });

  const shelteredStorms = stormHistory.filter((s) => s?.sheltered === true);

  const breakdown: XpBreakdown = {
    checkIn: safeRecords.length * XP_RULES.checkIn,
    exerciseReached80: daysAt80 * XP_RULES.exerciseReached80,
    exerciseReached100: daysAt100 * XP_RULES.exerciseReached100,
    mindSession: countableMind * XP_RULES.mindSession,
    weeklyPulse: pulseResults.length * XP_RULES.weeklyPulse,
    journalEntry: journalByDay.size * XP_RULES.journalEntry,
    stormSheltered: shelteredStorms.length * XP_RULES.stormSheltered,
    badgeBonuses: 0,
  };

  // --- Streaks ---------------------------------------------------------------
  const checkInPresent = new Set(safeRecords.map((r) => r.missionDay));
  const exercisePresent = new Set(
    safeRecords.filter((r) => r.exercise >= EXERCISE_80_MIN).map((r) => r.missionDay)
  );
  const checkInStreaks = forgivingStreaks(checkInPresent, latestDay);
  const exerciseStreaks = forgivingStreaks(exercisePresent, latestDay);

  // --- Badges ----------------------------------------------------------------
  const ruleValues: Record<string, { current: number; day: number | null }> = {
    firstCheckIn: { current: Math.min(safeRecords.length, 1), day: safeRecords[0]?.missionDay ?? null },
    checkInStreak14: {
      current: checkInStreaks.best,
      day: dayStreakReached(safeRecords, checkInPresent, 14),
    },
    checkInStreak30: {
      current: checkInStreaks.best,
      day: dayStreakReached(safeRecords, checkInPresent, 30),
    },
    exerciseStreak7: {
      current: exerciseStreaks.best,
      day: dayStreakReached(safeRecords, exercisePresent, 7),
    },
    exercise100Days21: {
      current: daysAt100,
      day: countCrossings(safeRecords, (r) => (r.exercise >= EXERCISE_TARGET_MIN ? 1 : 0), 21).dayReached,
    },
    mindSessions5: {
      current: Math.min(sessions.length, 5),
      day: countCrossings(sessions, () => 1, 5).dayReached ?? null,
    },
    mindSessions20: {
      current: Math.min(sessions.length, 20),
      day: countCrossings(sessions, () => 1, 20).dayReached ?? null,
    },
    journal7: {
      current: Math.min(journalEntries.length, 7),
      day: countCrossings(journalEntries as { missionDay: number }[], () => 1, 7).dayReached ?? null,
    },
    pulses3: {
      current: Math.min(pulseResults.length, 3),
      day: countCrossings(pulseResults, () => 1, 3).dayReached ?? null,
    },
    stormSheltered1: {
      current: Math.min(shelteredStorms.length, 1),
      day: shelteredStorms[0]?.missionDay ?? null,
    },
    stormSheltered3: {
      current: Math.min(shelteredStorms.length, 3),
      day: shelteredStorms.length >= 3 ? shelteredStorms[2].missionDay : null,
    },
    missionDay45: { current: Math.min(latestDay, 45), day: latestDay >= 45 ? 45 : null },
    missionDay90: { current: Math.min(latestDay, 90), day: latestDay >= 90 ? 90 : null },
  };

  const badges: BadgeStatus[] = BADGES.map((def) => {
    const value = ruleValues[def.rule] ?? { current: 0, day: null };
    const target = def.rule === 'firstCheckIn' ? 1 : Number(def.rule.match(/\d+$/)?.[0] ?? 1);
    const unlocked = value.current >= target;
    return {
      def,
      status: unlocked ? 'unlocked' : 'locked',
      progress: { current: Math.min(value.current, target), target },
      unlockedMissionDay: unlocked ? (value.day ?? latestDay) || undefined : undefined,
    };
  });

  badges.forEach((b) => {
    if (b.status === 'unlocked') breakdown.badgeBonuses += b.def.xpBonus;
  });

  const totalXp = Object.values(breakdown).reduce((sum, n) => sum + n, 0);

  // --- Levels ----------------------------------------------------------------
  let levelIndex = 0;
  LEVELS.forEach((l, i) => {
    if (totalXp >= l.minXp) levelIndex = i;
  });
  const level = LEVELS[levelIndex];
  const nextLevel = LEVELS[levelIndex + 1] ?? null;
  const span = nextLevel ? nextLevel.minXp - level.minXp : 1;
  const progressPercent = nextLevel
    ? Math.min(100, Math.max(0, ((totalXp - level.minXp) / span) * 100))
    : 100;
  const xpToNext = nextLevel ? Math.max(0, nextLevel.minXp - totalXp) : 0;

  // --- Today's missions ------------------------------------------------------
  const todayIsCheckedIn = latest?.date === todayISO();
  const todayDay = latest ? (todayIsCheckedIn ? latest.missionDay : latest.missionDay + 1) : 1;
  const todayRecord = safeRecords.find((r) => r.missionDay === todayDay);
  const todayExercisePercent = todayRecord
    ? Math.min(100, Math.round((todayRecord.exercise / EXERCISE_TARGET_MIN) * 100))
    : 0;
  const todayMindSessions = mindByDay.get(todayDay) ?? 0;

  const missionProgress: Record<string, number> = {
    checkin: todayRecord ? 1 : 0,
    exercise80: todayExercisePercent >= 80 ? 1 : todayExercisePercent / 80,
    mind: Math.min(1, todayMindSessions),
  };

  const todayMissions: TodayMission[] = DAILY_MISSIONS.map((m) => ({
    id: m.id,
    label: m.label,
    xp: m.xp,
    done: missionProgress[m.id] >= 1,
    progress: Math.min(1, missionProgress[m.id] ?? 0),
  }));

  // --- Weekly challenges -----------------------------------------------------
  const lastSeven: LastSevenDay[] = [];
  for (let day = Math.max(1, latestDay - 6); day <= latestDay; day++) {
    const r = safeRecords.find((rec) => rec.missionDay === day);
    lastSeven.push({
      missionDay: day,
      checkedIn: Boolean(r),
      exercisePercent: r ? Math.min(100, Math.round((r.exercise / EXERCISE_TARGET_MIN) * 100)) : 0,
      mindSessions: mindByDay.get(day) ?? 0,
    });
  }

  const weekExerciseDays = lastSeven.filter((d) => d.exercisePercent >= 80).length;
  const weekMindSessions = lastSeven.reduce((sum, d) => sum + d.mindSessions, 0);

  const challengeCurrent: Record<string, number> = {
    exercise5of7: weekExerciseDays,
    mind3: weekMindSessions,
    streak7: checkInStreaks.current,
  };

  const weeklyChallenges: WeeklyChallenge[] = WEEKLY_CHALLENGES.map((c) => ({
    id: c.id,
    label: c.label,
    rewardLabel: c.rewardLabel,
    current: challengeCurrent[c.id] ?? 0,
    target: c.target,
    done: (challengeCurrent[c.id] ?? 0) >= c.target,
  }));

  return {
    xpBreakdown: breakdown,
    totalXp,
    level,
    nextLevel,
    progressPercent,
    xpToNext,
    streaks: {
      checkInStreak: checkInStreaks.current,
      checkInBest: checkInStreaks.best,
      exerciseStreak: exerciseStreaks.current,
      exerciseBest: exerciseStreaks.best,
      restDayUsed: checkInStreaks.restDayUsed || exerciseStreaks.restDayUsed,
    },
    badges,
    todayMissions,
    weeklyChallenges,
    lastSevenDays: lastSeven,
  };
}

// Dev-only sanity output, run once when the engine is first used.
let sanityLogged = false;
export function logXpSanity(result: GamificationResult): void {
  if (!import.meta.env.DEV || sanityLogged) return;
  sanityLogged = true;
  console.table({ ...result.xpBreakdown, total: result.totalXp });
}
