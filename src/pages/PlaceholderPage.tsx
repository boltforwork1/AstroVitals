import type { LucideIcon } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col items-center justify-center text-center py-20 sm:py-32">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-accent/10 rounded-2xl blur-2xl" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-space-surface border border-space-border">
            <Icon className="w-9 h-9 text-accent" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-space-text mb-3">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-space-muted max-w-md leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
