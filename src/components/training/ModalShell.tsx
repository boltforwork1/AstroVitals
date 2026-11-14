import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ModalShellProps {
  titleId: string;
  onClose: () => void;
  maxWidthClass?: string;
  children: ReactNode;
}

export default function ModalShell({ titleId, onClose, maxWidthClass = 'max-w-lg', children }: ModalShellProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`relative w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto bg-space-surface border border-space-border rounded-xl shadow-2xl outline-none`}
      >
        {children}
      </motion.div>
    </div>
  );
}
