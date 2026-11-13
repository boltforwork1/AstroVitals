import { useState } from 'react';
import { Brain, ChevronDown, HeartPulse, ShieldCheck } from 'lucide-react';

const POINTS = [
  {
    icon: HeartPulse,
    text: 'Radiation can raise long-term cancer risk and cardiovascular risk.',
  },
  {
    icon: Brain,
    text: 'It can affect the central nervous system and weaken immune function.',
  },
  {
    icon: ShieldCheck,
    text: 'The crew limits exposure with shielding, storm shelters, and scheduling of outside work.',
  },
];

export default function WhyRadiationCard() {
  const [showMethod, setShowMethod] = useState(false);

  return (
    <section aria-labelledby="why-radiation-title" className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6">
      <h2 id="why-radiation-title" className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-4">
        Why radiation matters
      </h2>

      <ul className="space-y-3">
        {POINTS.map((p) => (
          <li key={p.text} className="flex items-start gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 shrink-0">
              <p.icon className="w-4 h-4 text-accent" />
            </span>
            <span className="text-sm text-space-text leading-relaxed pt-1">{p.text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 pt-4 border-t border-space-border">
        <button
          type="button"
          onClick={() => setShowMethod((s) => !s)}
          aria-expanded={showMethod}
          className="flex items-center gap-1.5 text-sm font-medium text-space-muted hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMethod ? 'rotate-180' : ''}`} />
          How it is measured
        </button>
        {showMethod && (
          <p className="text-sm text-space-muted leading-relaxed mt-3 bg-space-bg/40 border border-space-border rounded-lg p-3">
            Crew members wear personal dosimeters, and the spacecraft carries radiation monitors. In this app the dose
            is simulated, so the numbers show how the system works rather than a real measurement.
          </p>
        )}
      </div>
    </section>
  );
}
