import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PersonStanding,
  ClipboardCheck,
  TrendingUp,
  Radiation,
  Brain,
  Dumbbell,
  Bot,
  Activity,
  Bell,
  Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/body-map', label: 'Body Map', icon: PersonStanding },
  { to: '/check-in', label: 'Check-in', icon: ClipboardCheck },
  { to: '/trends', label: 'Trends', icon: TrendingUp },
  { to: '/radiation', label: 'Radiation', icon: Radiation },
  { to: '/mind', label: 'Mind', icon: Brain },
  { to: '/training', label: 'Training', icon: Dumbbell },
  { to: '/assistant', label: 'Assistant', icon: Bot },
  { to: '/rewards', label: 'Rewards', icon: Trophy },
];

export default function Sidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-space-border bg-space-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-space-border">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 border border-accent/20">
            <Activity className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-space-text">
              AstroVitals
            </h1>
            <p className="text-[11px] text-space-muted">Health Digital Twin</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-smooth',
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-space-muted hover:text-space-text hover:bg-space-border/40 border border-transparent',
                ].join(' ')
              }
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-space-border">
          <p className="text-[11px] text-space-muted">System Online</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-status-normal animate-pulse" />
            <span className="text-xs text-space-muted">Telemetry Active</span>
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-space-surface/95 backdrop-blur-md border-t border-space-border">
        <div className="flex items-center justify-around px-1 py-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors duration-200 shrink-0',
                  isActive ? 'text-accent' : 'text-space-muted',
                ].join(' ')
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
