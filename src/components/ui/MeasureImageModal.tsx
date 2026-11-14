import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface MeasureGuideData {
  src: string;
  title: string;
  alt: string;
}

interface MeasureImageModalProps {
  open: boolean;
  onClose: () => void;
  guide: MeasureGuideData | null;
  fallbackText?: string;
}

const ASPECT_RATIO = 1099 / 689;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function MeasureImageModal({ open, onClose, guide, fallbackText }: MeasureImageModalProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => closeBtnRef.current?.focus());
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    };
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (!open) {
      setLoaded(false);
      setErrored(false);
    }
  }, [open]);

  if (!guide) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0"
            style={{
              background: 'rgba(7, 11, 20, 0.9)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <style>{`@supports (backdrop-filter: blur(10px)) { [data-backdrop] { background: rgba(7, 11, 20, 0.55) !important; } }`}</style>
          </motion.div>

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="measure-guide-title"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative flex items-center justify-center"
            data-backdrop
          >
            <span id="measure-guide-title" className="sr-only">
              {guide.title}
            </span>

            <div className="relative" style={{ maxWidth: 'min(1100px, 94vw)' }}>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute z-10 flex items-center justify-center w-11 h-11 rounded-full text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent max-[640px]:!top-2 max-[640px]:!right-2"
                style={{
                  top: '-12px',
                  right: '-12px',
                  backgroundColor: '#0F1626',
                  border: '1px solid #1C2740',
                }}
              >
                <X className="w-5 h-5" />
              </button>

              {!loaded && !errored && (
                <div
                  className="rounded-[20px] overflow-hidden relative"
                  style={{
                    backgroundColor: '#0F1626',
                    aspectRatio: ASPECT_RATIO,
                    width: 'min(1100px, 94vw)',
                  }}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      background:
                        'linear-gradient(90deg, #0F1626 0%, #1C2740 50%, #0F1626 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'measureShimmer 1.4s infinite linear',
                    }}
                  />
                </div>
              )}

              {errored ? (
                <div
                  className="rounded-[20px] overflow-hidden flex flex-col items-center justify-center text-center gap-2"
                  style={{
                    backgroundColor: '#0F1626',
                    width: 'min(1100px, 94vw)',
                    maxWidth: '460px',
                    minHeight: '220px',
                    padding: '32px 24px',
                  }}
                >
                  <p className="text-sm font-medium text-space-text">Illustration unavailable offline</p>
                  {fallbackText && (
                    <p className="text-xs text-space-muted leading-relaxed">{fallbackText}</p>
                  )}
                </div>
              ) : (
                <img
                  src={guide.src}
                  alt={guide.alt}
                  decoding="async"
                  onLoad={() => setLoaded(true)}
                  onError={() => setErrored(true)}
                  className="block"
                  style={{
                    display: loaded ? 'block' : 'none',
                    width: 'auto',
                    height: 'auto',
                    maxWidth: 'min(1100px, 94vw)',
                    maxHeight: '88vh',
                    objectFit: 'contain',
                    borderRadius: '20px',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
                  }}
                />
              )}
            </div>
          </motion.div>

          <style>{`
            @keyframes measureShimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
