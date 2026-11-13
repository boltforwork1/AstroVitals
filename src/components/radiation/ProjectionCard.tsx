import { TriangleAlert as AlertTriangle, CircleCheck } from 'lucide-react';
import { CAREER_LIMIT_MSV } from '@/data/radiationConfig';
import type { DoseProjection } from '@/utils/radiation';

interface ProjectionCardProps {
  projection: DoseProjection;
  missionLength: number;
}

const TONES = {
  normal: {
    box: 'border-space-border bg-space-surface',
    text: 'text-status-normal',
    bar: 'bg-status-normal',
  },
  caution: {
    box: 'border-status-caution/40 bg-status-caution/10',
    text: 'text-status-caution',
    bar: 'bg-status-caution',
  },
  critical: {
    box: 'border-status-critical/40 bg-status-critical/10',
    text: 'text-status-critical',
    bar: 'bg-status-critical',
  },
} as const;

export default function ProjectionCard({ projection, missionLength }: ProjectionCardProps) {
  const { projectedTotal, percentOfLimit, remainingDays, recentAverage } = projection;
  const tone = percentOfLimit > 100 ? 'critical' : percentOfLimit > 80 ? 'caution' : 'normal';
  const styles = TONES[tone];
  const barWidth = Math.min(100, percentOfLimit);
  const Icon = tone === 'normal' ? CircleCheck : AlertTriangle;

  return (
    <section aria-labelledby="projection-title" className={`rounded-xl border p-5 sm:p-6 ${styles.box}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${styles.text}`} />
        <div className="flex-1 min-w-0">
          <h2 id="projection-title" className="text-sm font-semibold text-space-muted uppercase tracking-wider">
            Mission projection
          </h2>
          <p className="text-base text-space-text leading-relaxed mt-2">
            At the current rate you will reach{' '}
            <span className={`font-semibold tabular-nums ${styles.text}`}>{projectedTotal.toFixed(1)} mSv</span>{' '}
            by day {missionLength} ({percentOfLimit.toFixed(1)}% of the demo limit of {CAREER_LIMIT_MSV} mSv).
          </p>
          <p className="text-sm text-space-muted mt-2">
            {remainingDays} {remainingDays === 1 ? 'day' : 'days'} remain in the mission. The projection uses the
            last 14 days average of {recentAverage.toFixed(2)} mSv per day.
          </p>

          <div className="mt-4 h-2 rounded-full bg-space-border overflow-hidden" aria-hidden="true">
            <div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${barWidth}%` }} />
          </div>

          {tone === 'caution' && (
            <p className="text-sm text-status-caution mt-3">
              The projection is above 80% of the limit. Review shielding and how outside work is scheduled.
            </p>
          )}
          {tone === 'critical' && (
            <p className="text-sm text-status-critical mt-3">
              The projection exceeds the limit. Escalate to the flight surgeon and mission planners.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
