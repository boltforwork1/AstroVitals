import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useRecords } from '@/context/RecordsContext';
import { useGamification } from '@/context/GamificationContext';

interface Crewmate {
  name: string;
  role: string;
  initials: string;
  seed: number;
}

const CREWMATES: Crewmate[] = [
  { name: 'Dr. Maya Chen', role: 'Flight Surgeon', initials: 'MC', seed: 1 },
  { name: 'Lt. Kenji Tanaka', role: 'Flight Engineer', initials: 'KT', seed: 2 },
  { name: 'Sgt. Sofia Reyes', role: 'Mission Specialist', initials: 'SR', seed: 3 },
];

function crewCheckedIn(seed: number, day: number): boolean {
  return ((seed * 37 + day * 13) % 10) > 2;
}

function crewMindSessions(seed: number, day: number): number {
  return (seed * 29 + day * 11) % 3;
}

const MIND_GOAL = 12;

export default function CrewGoals() {
  const { records } = useRecords();
  const { lastSevenDays } = useGamification();
  const latestDay = records[records.length - 1]?.missionDay ?? 0;
  const userCheckedInDays = useMemo(() => new Set(records.map((r) => r.missionDay)), [records]);

  const crewStats = useMemo(
    () =>
      CREWMATES.map((c) => ({
        ...c,
        checkedInToday: crewCheckedIn(c.seed, latestDay),
      })),
    [latestDay]
  );

  const userCheckedInToday = userCheckedInDays.has(latestDay);
  const allCheckedInToday =
    userCheckedInToday && crewStats.every((c) => c.checkedInToday);

  const crewStreak = useMemo(() => {
    let streak = 0;
    for (let day = latestDay; day >= 1; day--) {
      const userIn = userCheckedInDays.has(day);
      const crewIn = CREWMATES.every((c) => crewCheckedIn(c.seed, day));
      if (userIn && crewIn) streak++;
      else break;
    }
    return streak;
  }, [latestDay, userCheckedInDays]);

  const crewMindThisWeek = useMemo(() => {
    const userTotal = lastSevenDays.reduce((sum, d) => sum + d.mindSessions, 0);
    const crewTotal = CREWMATES.reduce((sum, c) => {
      const days = lastSevenDays.map((d) => d.missionDay);
      return sum + days.reduce((s, day) => s + crewMindSessions(c.seed, day), 0);
    }, 0);
    return userTotal + crewTotal;
  }, [lastSevenDays]);

  const allFour = [
    { name: 'You', role: 'Commander', initials: 'AR', checkedInToday: userCheckedInToday, isUser: true },
    ...crewStats.map((c) => ({ ...c, isUser: false })),
  ];

  return (
    <section
      aria-labelledby="crew-goals-title"
      className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 shrink-0">
          <Users className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 id="crew-goals-title" className="text-base font-semibold text-space-text">
            Crew Goals
          </h2>
          <p className="text-[11px] text-space-muted">Simulated crew for the demo</p>
        </div>
      </div>

      {/* Crew avatars */}
      <div className="flex flex-wrap gap-3 my-5">
        {allFour.map((member) => (
          <div key={member.name} className="flex flex-col items-center gap-1.5 w-16">
            <div className="relative">
              <div
                className={`flex items-center justify-center w-11 h-11 rounded-full border-2 ${
                  member.isUser
                    ? 'bg-gradient-to-br from-accent/20 to-accent/5 border-accent/40'
                    : 'bg-space-bg border-space-border'
                }`}
              >
                <span className={`text-xs font-bold ${member.isUser ? 'text-accent' : 'text-space-muted'}`}>
                  {member.initials}
                </span>
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-space-surface"
                style={{
                  backgroundColor: member.checkedInToday ? '#22C55E' : '#3A4A6B',
                }}
                title={member.checkedInToday ? 'Checked in today' : 'Not checked in'}
              />
            </div>
            <span className="text-[10px] text-space-muted text-center leading-tight">{member.name}</span>
          </div>
        ))}
      </div>

      {/* Shared progress bars */}
      <div className="space-y-5">
        <CrewGoalBar
          label="Crew check-in streak"
          current={crewStreak}
          target={30}
          unit="days"
          allDoneToday={allCheckedInToday}
        />
        <CrewGoalBar
          label="Crew wellbeing hours: team mind sessions this week"
          current={crewMindThisWeek}
          target={MIND_GOAL}
          unit="sessions"
        />
      </div>

      <p className="text-[11px] text-space-muted mt-5 pt-4 border-t border-space-border leading-relaxed">
        Crew goals are collaborative, not a competition.
      </p>
    </section>
  );
}

function CrewGoalBar({
  label,
  current,
  target,
  unit,
  allDoneToday,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  allDoneToday?: boolean;
}) {
  const pct = Math.min(100, (current / target) * 100);
  const done = current >= target;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-sm text-space-text">{label}</span>
        <span className="text-xs text-space-muted tabular-nums shrink-0">
          {Math.min(current, target)}/{target} {unit}
          {done && <span className="text-status-normal ml-1.5">Done</span>}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-space-border overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${done ? 'bg-status-normal' : 'bg-accent'}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {allDoneToday !== undefined && (
        <p className="text-[11px] text-space-muted mt-1.5">
          {allDoneToday ? 'All four crew members checked in today.' : 'Waiting for all crew members to check in today.'}
        </p>
      )}
    </div>
  );
}
