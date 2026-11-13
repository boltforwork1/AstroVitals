import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radiation, ChevronRight } from 'lucide-react';
import type { DailyRecord } from '@/types/health';

interface RadiationMiniCardProps {
  records: DailyRecord[];
}

const MISSION_LIMIT_MSV = 250;

export default function RadiationMiniCard({ records }: RadiationMiniCardProps) {
  const navigate = useNavigate();
  const totalDose = records.reduce((sum, r) => sum + r.radiationDose, 0);
  const roundedDose = Math.round(totalDose * 100) / 100;
  const percent = Math.min(100, (totalDose / MISSION_LIMIT_MSV) * 100);
  const barColor = percent > 75 ? '#EF4444' : percent > 50 ? '#F59E0B' : '#22C55E';

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      onClick={() => navigate('/radiation')}
      className="w-full flex items-center gap-4 bg-space-surface border border-space-border rounded-xl p-5 text-left transition-all duration-200 hover:border-space-muted/40 group"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 shrink-0">
        <Radiation className="w-6 h-6 text-accent" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-semibold text-space-text">Cumulative Radiation Dose</p>
            <p className="text-xs text-space-muted mt-0.5">Illustrative limit for demo</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-space-text tabular-nums">
              {roundedDose.toFixed(1)}
            </span>
            <span className="text-xs text-space-muted ml-1">/ {MISSION_LIMIT_MSV} mSv</span>
          </div>
        </div>

        <div className="relative h-2 rounded-full bg-space-border overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ backgroundColor: barColor }}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
          />
        </div>

        <p className="text-xs text-space-muted mt-2">
          {percent.toFixed(1)}% of mission limit
        </p>
      </div>

      <ChevronRight className="w-5 h-5 text-space-muted shrink-0 group-hover:text-space-text transition-colors" />
    </motion.button>
  );
}
