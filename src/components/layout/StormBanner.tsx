import { Link } from 'react-router-dom';
import { ArrowRight, ShieldAlert, Sun } from 'lucide-react';
import { useStorm } from '@/context/StormContext';

const PHASE_TEXT = {
  warning: 'Solar particle event warning. Go to shelter now.',
  shelter: 'Sheltering in progress. Complete the shelter checklist.',
  recovery: 'Solar particle event passed. All clear, review your dose.',
} as const;

export default function StormBanner() {
  const { activeStorm } = useStorm();
  if (!activeStorm) return null;

  const isWarning = activeStorm.phase === 'warning';
  const Icon = isWarning ? ShieldAlert : Sun;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 px-4 sm:px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-status-caution via-orange-500 to-status-critical ${
        isWarning ? 'animate-pulse' : ''
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="flex-1 min-w-0 truncate">{PHASE_TEXT[activeStorm.phase]}</span>
      <Link
        to="/radiation"
        className="inline-flex items-center gap-1 shrink-0 underline underline-offset-4 decoration-white/60 hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
      >
        Open radiation page
        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
