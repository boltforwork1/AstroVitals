// Gamification tuning values. XP rewards logging and effort, never health values.

export const EXERCISE_TARGET_MIN = 120;
export const EXERCISE_80_MIN = Math.round(EXERCISE_TARGET_MIN * 0.8);

export const XP_RULES = {
  checkIn: 50,
  exerciseReached80: 30,
  exerciseReached100: 20,
  mindSession: 20,
  weeklyPulse: 40,
  journalEntry: 15,
  stormSheltered: 100,
} as const;

export const MIND_SESSIONS_PER_DAY = 2;
export const JOURNAL_ENTRIES_PER_DAY = 1;

export type BadgeTier = 'bronze' | 'silver' | 'gold';

export const TIER_BONUS: Record<BadgeTier, number> = {
  bronze: 50,
  silver: 100,
  gold: 200,
};

export const TIER_COLOR: Record<BadgeTier, string> = {
  bronze: '#CD7F32',
  silver: '#A8B2C1',
  gold: '#F5C542',
};

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  xpBonus: number;
  rule: string;
}

export const BADGES: BadgeDef[] = [
  { id: 'first_contact', name: 'First Contact', description: 'Complete your first check-in', icon: 'Rocket', tier: 'bronze', xpBonus: TIER_BONUS.bronze, rule: 'firstCheckIn' },
  { id: 'honest_logger', name: 'Honest Logger', description: '14-day check-in streak', icon: 'CalendarCheck', tier: 'silver', xpBonus: TIER_BONUS.silver, rule: 'checkInStreak14' },
  { id: 'steady_hands', name: 'Steady Hands', description: '30-day check-in streak', icon: 'Medal', tier: 'gold', xpBonus: TIER_BONUS.gold, rule: 'checkInStreak30' },
  { id: 'bone_guardian', name: 'Bone Guardian', description: '7 days in a row at 80% of the exercise target', icon: 'Bone', tier: 'silver', xpBonus: TIER_BONUS.silver, rule: 'exerciseStreak7' },
  { id: 'iron_crew', name: 'Iron Crew', description: '21 days total at 100% of the exercise target', icon: 'Dumbbell', tier: 'gold', xpBonus: TIER_BONUS.gold, rule: 'exercise100Days21' },
  { id: 'calm_mind', name: 'Calm Mind', description: 'Complete 5 mind sessions', icon: 'Wind', tier: 'bronze', xpBonus: TIER_BONUS.bronze, rule: 'mindSessions5' },
  { id: 'zen_master', name: 'Zen Master', description: 'Complete 20 mind sessions', icon: 'Sparkles', tier: 'gold', xpBonus: TIER_BONUS.gold, rule: 'mindSessions20' },
  { id: 'reflector', name: 'Reflector', description: 'Write 7 journal entries', icon: 'BookOpen', tier: 'bronze', xpBonus: TIER_BONUS.bronze, rule: 'journal7' },
  { id: 'pulse_taker', name: 'Pulse Taker', description: 'Complete 3 weekly wellbeing pulses', icon: 'HeartPulse', tier: 'bronze', xpBonus: TIER_BONUS.bronze, rule: 'pulses3' },
  { id: 'storm_ready', name: 'Storm Ready', description: 'Shelter during a solar storm', icon: 'ShieldCheck', tier: 'silver', xpBonus: TIER_BONUS.silver, rule: 'stormSheltered1' },
  { id: 'storm_veteran', name: 'Storm Veteran', description: 'Shelter during 3 solar storms', icon: 'Shield', tier: 'gold', xpBonus: TIER_BONUS.gold, rule: 'stormSheltered3' },
  { id: 'quarter_mission', name: 'Quarter Mission', description: 'Reach mission day 45', icon: 'Flag', tier: 'bronze', xpBonus: TIER_BONUS.bronze, rule: 'missionDay45' },
  { id: 'halfway_there', name: 'Halfway There', description: 'Reach mission day 90', icon: 'MapPin', tier: 'silver', xpBonus: TIER_BONUS.silver, rule: 'missionDay90' },
];

export interface LevelDef {
  id: string;
  name: string;
  description: string;
  minXp: number;
  color: string;
}

export const LEVELS: LevelDef[] = [
  { id: 'cadet', name: 'Cadet', description: 'Every mission starts with the basics.', minXp: 0, color: '#8A97B5' },
  { id: 'specialist', name: 'Specialist', description: 'A steady routine is taking shape.', minXp: 800, color: '#22D3EE' },
  { id: 'flight_engineer', name: 'Flight Engineer', description: 'Reliable habits, well maintained.', minXp: 2000, color: '#22C55E' },
  { id: 'mission_specialist', name: 'Mission Specialist', description: 'Discipline the crew can count on.', minXp: 3500, color: '#F59E0B' },
  { id: 'commander', name: 'Commander', description: 'Leading by example, day after day.', minXp: 5500, color: '#F97316' },
  { id: 'fleet_commander', name: 'Fleet Commander', description: 'The standard others aim for.', minXp: 8000, color: '#EF4444' },
];

export interface DailyMissionDef {
  id: string;
  label: string;
  xp: number;
}

export const DAILY_MISSIONS: DailyMissionDef[] = [
  { id: 'checkin', label: "Complete today's check-in", xp: 30 },
  { id: 'exercise80', label: 'Reach 80% of the exercise target', xp: 30 },
  { id: 'mind', label: 'Do one mind session', xp: 20 },
];

export interface WeeklyChallengeDef {
  id: string;
  label: string;
  rewardLabel: string;
  target: number;
}

export const WEEKLY_CHALLENGES: WeeklyChallengeDef[] = [
  { id: 'exercise5of7', label: 'Exercise 5 of the last 7 days at 80% of target', rewardLabel: 'Bonus XP', target: 5 },
  { id: 'mind3', label: 'Complete 3 mind sessions this week', rewardLabel: 'Bonus XP', target: 3 },
  { id: 'streak7', label: 'Check in 7 days in a row', rewardLabel: 'Bonus XP', target: 7 },
];
