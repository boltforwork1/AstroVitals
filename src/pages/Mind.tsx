import { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';
import { useRecords } from '@/context/RecordsContext';
import { useWellbeing } from '@/context/WellbeingContext';
import { buildWellbeingSignals } from '@/utils/wellbeing';
import MoodCard from '@/components/mind/MoodCard';
import WellbeingSignals from '@/components/mind/WellbeingSignals';
import PulseCheck from '@/components/mind/PulseCheck';
import BreathingExercise from '@/components/mind/BreathingExercise';
import GroundingExercise from '@/components/mind/GroundingExercise';
import CrewConnection from '@/components/mind/CrewConnection';
import Journal from '@/components/mind/Journal';
import WhyItMatters from '@/components/mind/WhyItMatters';
import GroundSupportModal from '@/components/mind/GroundSupportModal';

export default function Mind() {
  const { records } = useRecords();
  const { journalEntries, sessions } = useWellbeing();
  const [groundSupportOpen, setGroundSupportOpen] = useState(false);

  const signals = buildWellbeingSignals(records, journalEntries, sessions);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-space-text">
          Mind & Crew Wellbeing
        </h1>
        <p className="text-sm text-space-muted mt-0.5">
          Isolation and confinement are real mission hazards. Small daily habits help.
        </p>
      </motion.div>

      {/* Row 1: Mood + Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MoodCard records={records} />
        <WellbeingSignals signals={signals} />
      </div>

      {/* Row 2: Weekly wellbeing pulse */}
      <PulseCheck />

      {/* Row 3: Three tool cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BreathingExercise />
        <GroundingExercise />
        <CrewConnection />
      </div>

      {/* Row 4: Journal */}
      <Journal />

      {/* Row 5: Why this matters + ground support */}
      <WhyItMatters />

      <div className="flex justify-center">
        <button
          onClick={() => setGroundSupportOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-status-critical/10 border border-status-critical/20 text-status-critical text-sm font-medium transition-all hover:bg-status-critical/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-critical"
        >
          <Radio className="w-4 h-4" />
          Prepare note for ground support
        </button>
      </div>

      {groundSupportOpen && (
        <GroundSupportModal
          records={records}
          signals={signals}
          onClose={() => setGroundSupportOpen(false)}
        />
      )}
    </div>
  );
}
