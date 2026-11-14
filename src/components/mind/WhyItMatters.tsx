import { Brain, Radio, Sun } from 'lucide-react';

const POINTS = [
  {
    icon: Brain,
    text: 'Isolation and confinement can affect mood, sleep, and teamwork over weeks and months.',
  },
  {
    icon: Radio,
    text: 'Communication delay increases feelings of distance from family and ground support.',
  },
  {
    icon: Sun,
    text: 'Routines, controlled lighting, consistent sleep, and social contact are practical countermeasures.',
  },
];

export default function WhyItMatters() {
  return (
    <section aria-labelledby="why-mind-title" className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6">
      <h2 id="why-mind-title" className="text-sm font-semibold text-space-muted uppercase tracking-wider mb-4">
        Why this matters in space
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
      <p className="text-sm text-status-critical mt-5 pt-4 border-t border-space-border">
        If you feel overwhelmed or unsafe, contact ground support or the crew medical officer right away.
      </p>
    </section>
  );
}
