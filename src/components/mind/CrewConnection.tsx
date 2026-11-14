import { Users, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWellbeing } from '@/context/WellbeingContext';
import { useRecords } from '@/context/RecordsContext';

const SUGGESTIONS = [
  'Share a meal with the crew',
  'A 10-minute video call with family or friends',
  'Send a message to the ground team',
  'A short crew activity (game, music, or workout together)',
] as const;

export default function CrewConnection() {
  const { sessions, addSession } = useWellbeing();
  const { latestRecord } = useRecords();

  const isDone = (index: number) => {
    return sessions.some(
      (s) =>
        s.type === 'connection' &&
        s.missionDay === latestRecord.missionDay &&
        s.durationSec === index
    );
  };

  const markDone = (index: number) => {
    if (isDone(index)) return;
    addSession('connection', index, latestRecord.missionDay);
  };

  return (
    <div className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 shrink-0">
          <Users className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-space-text">Crew Connection</h3>
          <p className="text-xs text-space-muted">Small social habits counter isolation</p>
        </div>
      </div>

      <ul className="space-y-2">
        {SUGGESTIONS.map((suggestion, i) => {
          const done = isDone(i);
          return (
            <li key={i}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-space-border bg-space-bg/40">
                <span className="flex-1 text-sm text-space-text">{suggestion}</span>
                <button
                  onClick={() => markDone(i)}
                  disabled={done}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    done
                      ? 'bg-status-normal/15 text-status-normal cursor-default'
                      : 'bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20'
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
                >
                  {done && <Check className="w-3 h-3" />}
                  {done ? 'Done' : 'Done'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] text-space-muted mt-3">
        {sessions.filter((s) => s.type === 'connection').length} connection sessions logged
      </p>
    </div>
  );
}
