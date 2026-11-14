import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, BookOpen } from 'lucide-react';
import { useWellbeing } from '@/context/WellbeingContext';
import { useRecords } from '@/context/RecordsContext';
import { TONE_COLOR } from '@/utils/tone';
import type { Tone } from '@/utils/tone';

const TONE_LABEL: Record<Tone, string> = {
  positive: 'Positive',
  neutral: 'Neutral',
  low: 'Low',
};

export default function Journal() {
  const { journalEntries, addJournalEntry, deleteJournalEntry } = useWellbeing();
  const { latestRecord } = useRecords();
  const [text, setText] = useState('');

  const sorted = [...journalEntries].reverse();

  const handleSave = () => {
    if (text.trim().length === 0) return;
    addJournalEntry(text.trim(), latestRecord.missionDay);
    setText('');
  };

  return (
    <div className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 shrink-0">
          <BookOpen className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-space-text">Journal</h2>
          <p className="text-xs text-space-muted">Reflect on your day</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <textarea
          value={text}
          maxLength={500}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full rounded-xl bg-space-bg/60 border border-space-border focus:border-accent/50 px-4 py-3 text-sm text-space-text placeholder-space-muted/60 resize-none outline-none transition-colors"
          placeholder="Write about your day, how you feel, what's on your mind..."
          aria-label="Journal entry text"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-space-muted tabular-nums">{text.length}/500</span>
          <button
            onClick={handleSave}
            disabled={text.trim().length === 0}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-space-bg transition-all hover:shadow-[0_0_20px_var(--color-accent-glow)] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Save entry
          </button>
        </div>
      </div>

      <p className="text-[11px] text-space-muted mb-4">
        Your journal stays on this device in the demo.
      </p>

      {sorted.length > 0 && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {sorted.map((entry) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-space-bg/40 border border-space-border"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: TONE_COLOR[entry.tone], boxShadow: `0 0 6px ${TONE_COLOR[entry.tone]}80` }}
                  title={TONE_LABEL[entry.tone]}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-space-muted">
                      Day {entry.missionDay} · {entry.date}
                    </span>
                    <span className="text-[10px] text-space-muted" style={{ color: TONE_COLOR[entry.tone] }}>
                      {TONE_LABEL[entry.tone]}
                    </span>
                  </div>
                  <p className="text-sm text-space-text leading-relaxed whitespace-pre-wrap break-words">{entry.text}</p>
                </div>
                <button
                  onClick={() => deleteJournalEntry(entry.id)}
                  aria-label="Delete entry"
                  className="shrink-0 p-1.5 rounded-lg text-space-muted hover:text-status-critical hover:bg-status-critical/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
