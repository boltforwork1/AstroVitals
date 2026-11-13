import { LayoutDashboard } from 'lucide-react';
import PlaceholderPage from './PlaceholderPage';

export default function Dashboard() {
  return (
    <PlaceholderPage
      title="Dashboard"
      description="Mission-wide health overview with vital signs, alerts, and daily summaries at a glance."
      icon={LayoutDashboard}
    />
  );
}
