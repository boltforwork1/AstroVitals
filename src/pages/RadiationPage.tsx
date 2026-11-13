import { useMemo } from 'react';
import { useRecords } from '@/context/RecordsContext';
import { useStorm } from '@/context/StormContext';
import { crewMember } from '@/data/mockRecords';
import { buildDoseSeries, projectDose } from '@/utils/radiation';
import DoseGauge from '@/components/radiation/DoseGauge';
import DoseStatCards from '@/components/radiation/DoseStatCards';
import DoseChart from '@/components/radiation/DoseChart';
import ProjectionCard from '@/components/radiation/ProjectionCard';
import EnvironmentCompare from '@/components/radiation/EnvironmentCompare';
import WhyRadiationCard from '@/components/radiation/WhyRadiationCard';
import StormSimulator from '@/components/radiation/StormSimulator';

export default function RadiationPage() {
  const { records } = useRecords();
  const { history } = useStorm();
  const { missionLength } = crewMember;

  const projection = useMemo(() => projectDose(records, missionLength), [records, missionLength]);
  const stormDays = useMemo(() => new Set(history.map((h) => h.missionDay)), [history]);
  const series = useMemo(
    () => buildDoseSeries(records, projection.recentAverage, missionLength, stormDays),
    [records, projection.recentAverage, missionLength, stormDays]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-space-text">Radiation</h1>
        <p className="text-sm text-space-muted mt-1">
          Cumulative dose, mission projection, and solar storm practice
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <DoseGauge cumulative={projection.cumulative} />
        </div>
        <div className="lg:col-span-3">
          <DoseStatCards records={records} />
        </div>
      </div>

      <DoseChart rows={series} projectedTotal={projection.projectedTotal} />

      <ProjectionCard projection={projection} missionLength={missionLength} />

      <StormSimulator />

      <EnvironmentCompare cumulative={projection.cumulative} remainingDays={projection.remainingDays} />

      <WhyRadiationCard />
    </div>
  );
}
