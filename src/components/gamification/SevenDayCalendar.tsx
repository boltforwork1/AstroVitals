import { motion } from 'framer-motion';
import { useGamification } from '@/context/GamificationContext';

export default function SevenDayCalendar() {
  const { lastSevenDays } = useGamification();

  return (
    <section aria-labelledby="calendar-title" className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6">
      <h2 id="calendar-title" className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-4">
        Last 7 Mission Days
      </h2>

      <div className="grid grid-cols-7 gap-2">
        {lastSevenDays.map((day, i) => {
          const exerciseColor =
            day.exercisePercent >= 80 ? '#22C55E' : day.exercisePercent > 0 ? '#F59E0B' : '#3A4A6B';
          return (
            <motion.div
              key={day.missionDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex flex-col items-center gap-2 p-2.5 rounded-lg bg-space-bg/40 border border-space-border"
            >
              <span className="text-[10px] font-medium text-space-muted tabular-nums">D{day.missionDay}</span>

              {/* Check-in dot */}
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: day.checkedIn ? '#22C55E' : '#3A4A6B',
                  boxShadow: day.checkedIn ? '0 0 4px #22C55E80' : 'none',
                }}
                title={day.checkedIn ? 'Checked in' : 'No check-in'}
              />

              {/* Exercise mini bar */}
              <div className="w-full h-8 rounded-md bg-space-border overflow-hidden flex items-end">
                <div
                  className="w-full rounded-md transition-all"
                  style={{ height: `${Math.max(4, day.exercisePercent)}%`, backgroundColor: exerciseColor }}
                />
              </div>

              {/* Mind session dot */}
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: day.mindSessions > 0 ? '#22C55E' : '#3A4A6B',
                  boxShadow: day.mindSessions > 0 ? '0 0 4px #22C55E80' : 'none',
                }}
                title={day.mindSessions > 0 ? `${day.mindSessions} mind session(s)` : 'No mind session'}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-4 text-[11px] text-space-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-normal" /> Goal met
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-caution" /> Partial
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3A4A6B' }} /> None
        </span>
      </div>
    </section>
  );
}
