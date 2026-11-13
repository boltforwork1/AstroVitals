import { ClipboardCheck } from 'lucide-react';
import PlaceholderPage from './PlaceholderPage';

export default function CheckIn() {
  return (
    <PlaceholderPage
      title="Daily Check-in"
      description="Log today's vitals, symptoms, and subjective wellness for mission records."
      icon={ClipboardCheck}
    />
  );
}
