import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { HazardId } from '@/data/hazards';
import { hazards } from '@/data/hazards';
import { mockRecords } from '@/data/mockRecords';
import HumanBody from '@/components/bodymap/HumanBody';
import RegionPanel from '@/components/bodymap/RegionPanel';
import type { RegionId } from '@/data/bodyRegions';

export default function BodyMap() {
  const records = mockRecords;
  const todayRecord = records[records.length - 1];
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);
  const [activeHazard, setActiveHazard] = useState<HazardId | null>(null);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const handleSelectRegion = (id: RegionId) => {
    setSelectedRegion(id);
    setMobilePanelOpen(true);
  };

  const activeHazardInfo = activeHazard ? hazards.find((h) => h.id === activeHazard) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Hazard filter chips */}
      <div className="px-4 sm:px-6 pt-6 pb-3">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-space-text mb-3">
          Body Map
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            label="All"
            active={activeHazard === null}
            onClick={() => setActiveHazard(null)}
          />
          {hazards.map((h) => (
            <FilterChip
              key={h.id}
              label={h.label}
              active={activeHazard === h.id}
              color={h.color}
              onClick={() => setActiveHazard(h.id === activeHazard ? null : h.id)}
            />
          ))}
        </div>

        {/* Hazard description */}
        <div className="h-6 mt-2">
          <AnimatePresence mode="wait">
            {activeHazardInfo ? (
              <motion.p
                key={activeHazardInfo.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-space-muted"
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                  style={{ backgroundColor: activeHazardInfo.color }}
                />
                {activeHazardInfo.description}
              </motion.p>
            ) : (
              <motion.p
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-space-muted"
              >
                Select a hazard to see which body systems it affects most.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop: two columns; Mobile: body only, panel as bottom sheet */}
      <div className="flex-1 flex overflow-hidden">
        {/* Body area */}
        <div className="flex-1 flex items-center justify-center min-h-0 pb-6 px-4">
          <HumanBody
            record={todayRecord}
            selectedRegion={selectedRegion}
            onSelectRegion={handleSelectRegion}
            activeHazard={activeHazard}
          />
        </div>

        {/* Desktop detail panel */}
        <div className="hidden lg:block w-[45%] max-w-md border-l border-space-border bg-space-surface/50">
          <RegionPanel
            regionId={selectedRegion}
            record={todayRecord}
            records={records}
          />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {mobilePanelOpen && selectedRegion && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobilePanelOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 inset-x-0 z-50 max-h-[75vh] bg-space-surface border-t border-space-border rounded-t-2xl"
            >
              <div className="flex items-center justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-space-border" />
              </div>
              <button
                onClick={() => setMobilePanelOpen(false)}
                className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-lg text-space-muted hover:text-space-text hover:bg-space-border/50 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="max-h-[calc(75vh-2rem)] overflow-y-auto pb-4">
                <RegionPanel
                  regionId={selectedRegion}
                  record={todayRecord}
                  records={records}
                  onNavigate={() => setMobilePanelOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
        active
          ? 'bg-space-text/10 text-space-text border-space-text/30'
          : 'bg-space-surface text-space-muted border-space-border hover:border-space-muted/40',
      ].join(' ')}
    >
      {color && (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color, opacity: active ? 1 : 0.5 }}
        />
      )}
      <span>{label}</span>
    </button>
  );
}
