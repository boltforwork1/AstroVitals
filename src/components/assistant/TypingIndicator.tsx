import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 flex-row">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 border border-accent/20 shrink-0 mt-1">
        <span className="w-4 h-4 rounded-full bg-accent/30" />
      </div>
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-space-surface border border-space-border">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-space-muted"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.18,
            }}
          />
        ))}
      </div>
    </div>
  );
}
