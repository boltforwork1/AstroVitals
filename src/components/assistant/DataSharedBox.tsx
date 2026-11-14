import { useState } from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DataSharedBox() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-space-surface border border-space-border rounded-xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center justify-between w-full px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-space-text">
          <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
          What data is shared
        </span>
        <ChevronDown
          className={`w-4 h-4 text-space-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              <p className="text-xs text-space-muted leading-relaxed">
                When online, the assistant receives a compact text summary to answer your questions. It sees:
              </p>
              <ul className="text-xs text-space-muted space-y-1.5">
                <li className="flex gap-2"><span className="text-accent">-</span> Current mission day and overall health score</li>
                <li className="flex gap-2"><span className="text-accent">-</span> Latest values and status of all 8 health indicators (heart rate, blood pressure, glucose, temperature, sleep, mood, exercise, radiation dose)</li>
                <li className="flex gap-2"><span className="text-accent">-</span> 7-day trend direction for each indicator</li>
                <li className="flex gap-2"><span className="text-accent">-</span> Titles of up to 5 active alerts (critical first)</li>
              </ul>
              <p className="text-xs text-status-caution pt-1">
                This is simulated demo data only, not real medical data. Your chat messages are sent to the AI model.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
