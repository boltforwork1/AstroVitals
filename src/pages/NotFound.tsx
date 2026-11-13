import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col items-center justify-center text-center py-20 sm:py-32">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-status-critical/10 rounded-2xl blur-2xl" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-space-surface border border-space-border">
            <Compass className="w-9 h-9 text-status-critical" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-space-text mb-2">
          Lost in Space
        </h1>
        <p className="text-sm text-space-muted mb-8 max-w-sm">
          The page you're looking for has drifted out of orbit.
        </p>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm font-medium transition-all duration-200 hover:bg-accent/20 hover:shadow-[0_0_20px_var(--color-accent-glow)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
