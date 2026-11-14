import { motion } from 'framer-motion';
import { useGamification } from '@/context/GamificationContext';
import ProfileCard from '@/components/gamification/ProfileCard';
import TodaysMissions from '@/components/gamification/TodaysMissions';
import SevenDayCalendar from '@/components/gamification/SevenDayCalendar';
import BadgesGrid from '@/components/gamification/BadgesGrid';
import XpBreakdownChart from '@/components/gamification/XpBreakdownChart';
import CrewGoals from '@/components/gamification/CrewGoals';
import MissionTimeline from '@/components/gamification/MissionTimeline';
import HowXpWorks from '@/components/gamification/HowXpWorks';

export default function Rewards() {
  const { xpBreakdown } = useGamification();
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sectionProps = (index: number) =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: index * 0.08, duration: 0.4, ease: 'easeOut' as const },
        };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <motion.div {...sectionProps(0)}>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-space-text">
          Rewards &amp; Mission Progress
        </h1>
        <p className="text-sm text-space-muted mt-0.5">
          Small daily habits keep you healthy on a long mission.
        </p>
      </motion.div>

      <motion.div {...sectionProps(1)}>
        <ProfileCard />
      </motion.div>

      <motion.div {...sectionProps(2)}>
        <TodaysMissions />
      </motion.div>

      <motion.div {...sectionProps(3)}>
        <SevenDayCalendar />
      </motion.div>

      <motion.div {...sectionProps(4)}>
        <BadgesGrid />
      </motion.div>

      <motion.div {...sectionProps(5)}>
        <XpBreakdownChart xpBreakdown={xpBreakdown} />
      </motion.div>

      <motion.div {...sectionProps(6)}>
        <CrewGoals />
      </motion.div>

      <motion.div {...sectionProps(7)}>
        <MissionTimeline />
      </motion.div>

      <motion.div {...sectionProps(8)}>
        <HowXpWorks />
      </motion.div>
    </div>
  );
}
