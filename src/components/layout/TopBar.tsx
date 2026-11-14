import { Satellite } from 'lucide-react';
import { crewMember } from '@/data/mockRecords';
import { useRecords } from '@/context/RecordsContext';
import AlertsBell from '@/components/alerts/AlertsBell';
import LevelChip from '@/components/gamification/LevelChip';
import StormBanner from './StormBanner';

export default function TopBar() {
  const { latestRecord } = useRecords();
  const latestDay = latestRecord.missionDay;
  const { missionLength } = crewMember;

  return (
    <>
    <header className="sticky top-0 z-[60] flex items-center justify-between h-16 px-4 sm:px-6 border-b border-space-border bg-space-bg">
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:flex w-9 h-9 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-accent">AR</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-space-text truncate">
            {crewMember.name}
          </p>
          <p className="text-xs text-space-muted truncate">{crewMember.role}</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 text-sm">
        <span className="text-space-muted">Mission Day</span>
        <span className="font-semibold text-space-text tabular-nums">
          {latestDay}
        </span>
        <span className="text-space-muted">/ {missionLength}</span>
      </div>

      <div className="flex items-center gap-3">
        <LevelChip />
        <AlertsBell />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
          <Satellite className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-medium text-accent">ISS</span>
        </div>
      </div>
    </header>
    <StormBanner />
    </>
  );
}
