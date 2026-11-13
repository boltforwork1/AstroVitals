import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import type { IndicatorKey } from '@/types/health';
import { crewMember } from '@/data/mockRecords';
import { indicatorList } from '@/data/indicators';
import { useRecords } from '@/context/RecordsContext';
import HealthScoreCard from '@/components/dashboard/HealthScoreCard';
import AttentionPanel from '@/components/dashboard/AttentionPanel';
import IndicatorCard from '@/components/dashboard/IndicatorCard';
import RadiationMiniCard from '@/components/dashboard/RadiationMiniCard';
import IndicatorModal from '@/components/IndicatorModal';
import EarlyWarningsCard from '@/components/alerts/EarlyWarningsCard';

export default function Dashboard() {
  const { records, latestRecord: todayRecord } = useRecords();
  const [selectedKey, setSelectedKey] = useState<IndicatorKey | null>(null);

  const dateLabel = `Mission Day ${todayRecord.missionDay}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-space-text">
            Good day, {crewMember.name}
          </h1>
          <p className="text-sm text-space-muted mt-0.5">
            Here's your health overview for today
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-space-muted">
          <CalendarDays className="w-4 h-4" />
          <span className="font-medium text-space-text">{dateLabel}</span>
        </div>
      </motion.div>

      {/* Row 1: Health Score + Attention Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <HealthScoreCard todayRecord={todayRecord} records={records} />
        </div>
        <div className="lg:col-span-2">
          <AttentionPanel todayRecord={todayRecord} records={records} />
        </div>
      </div>

      <EarlyWarningsCard />

      {/* Row 2: Indicator Cards */}
      <div>
        <h2 className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-4">
          Vital Signs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {indicatorList.map((ind, index) => (
            <IndicatorCard
              key={ind.key}
              indicatorKey={ind.key}
              todayRecord={todayRecord}
              records={records}
              index={index}
              onClick={setSelectedKey}
            />
          ))}
        </div>
      </div>

      {/* Row 3: Radiation Mini Card */}
      <RadiationMiniCard records={records} />

      {/* Indicator Detail Modal */}
      <IndicatorModal
        indicatorKey={selectedKey}
        currentValue={selectedKey ? todayRecord[selectedKey] : null}
        onClose={() => setSelectedKey(null)}
      />
    </div>
  );
}
