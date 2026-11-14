import { useNavigate } from 'react-router-dom';
import { useGamification } from '@/context/GamificationContext';

export default function LevelChip() {
  const navigate = useNavigate();
  const { level, nextLevel, progressPercent, xpToNext } = useGamification();

  return (
    <button
      type="button"
      onClick={() => navigate('/rewards')}
      title={
        nextLevel
          ? `${xpToNext} XP to ${nextLevel.name}`
          : 'Highest level reached'
      }
      aria-label={`Level: ${level.name}. ${nextLevel ? `${xpToNext} XP to ${nextLevel.name}` : 'Highest level reached'}`}
      className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 hover:border-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: level.color, boxShadow: `0 0 6px ${level.color}80` }}
        aria-hidden="true"
      />
      <span className="text-xs font-semibold text-space-text whitespace-nowrap">{level.name}</span>
      <span className="w-12 h-1 rounded-full bg-space-border overflow-hidden shrink-0" aria-hidden="true">
        <span
          className="block h-full rounded-full bg-accent transition-[width] duration-500"
          style={{ width: `${Math.round(progressPercent)}%` }}
        />
      </span>
    </button>
  );
}
