import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Trash2, TriangleAlert as AlertTriangle, ArrowRight, Stethoscope, CircleCheck } from 'lucide-react';
import { useAlerts } from '@/context/AlertsContext';
import { useAssistantChat, checkEmergency } from '@/hooks/useAssistantChat';
import { ALERT_LEVEL_RANK } from '@/utils/alerts';
import MessageBubble from '@/components/assistant/MessageBubble';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import DataSharedBox from '@/components/assistant/DataSharedBox';

const MAX_INPUT = 500;

const DEFAULT_SUGGESTIONS = [
  'Why is my sleep dropping and what can I do?',
  'Explain my heart rate trend',
  'Why does bone loss happen in space?',
  'What should I do if I feel dizzy?',
  'Give me a 5-minute plan to reduce stress',
  'Should I contact the flight surgeon today?',
];

interface ConfirmClearProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmClearDialog({ onConfirm, onCancel }: ConfirmClearProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label="Clear chat"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-space-surface border border-space-border rounded-xl p-5 shadow-2xl">
        <h2 className="text-base font-semibold text-space-text mb-1.5">Clear chat?</h2>
        <p className="text-sm text-space-muted leading-relaxed mb-5">
          All messages in this conversation will be removed.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-space-muted border border-space-border hover:text-space-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-status-critical text-white hover:bg-status-critical/85 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Assistant() {
  const navigate = useNavigate();
  const { alerts } = useAlerts();
  const { messages, loading, isOnline, sendMessage, clearChat } = useAssistantChat();
  const [input, setInput] = useState('');
  const [showEmergency, setShowEmergency] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const sortedAlerts = [...alerts].sort(
    (a, b) => ALERT_LEVEL_RANK[b.level] - ALERT_LEVEL_RANK[a.level]
  );
  const priorityAlert = sortedAlerts.find((a) => a.level === 'critical' || a.level === 'caution');
  const suggestions = priorityAlert
    ? [`Tell me more about: ${priorityAlert.title}`, ...DEFAULT_SUGGESTIONS.slice(0, 5)]
    : DEFAULT_SUGGESTIONS;

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed.length === 0 || loading) return;
    setShowEmergency(checkEmergency(trimmed));
    sendMessage(trimmed);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text: string) => {
    if (loading) return;
    setShowEmergency(checkEmergency(text));
    sendMessage(text);
  };

  const onlineLabel = isOnline === 'offline' ? 'Offline demo mode' : 'Online';
  const onlineColor =
    isOnline === 'offline'
      ? 'text-status-caution bg-status-caution/10 border-status-caution/30'
      : 'text-status-normal bg-status-normal/10 border-status-normal/30';

  const isEmpty = messages.length === 0;
  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id;

  useEffect(() => {
    if (!showEmergency) return;
    const timer = setTimeout(() => setShowEmergency(false), 15_000);
    return () => clearTimeout(timer);
  }, [showEmergency]);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] lg:max-h-screen">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-6 pb-3 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 shrink-0">
              <Bot className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-space-text">
                AstroVitals Assistant
              </h1>
              <p className="text-sm text-space-muted mt-0.5">
                Ask about your health data, symptoms, and what to do next
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${onlineColor}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isOnline === 'offline' ? 'bg-status-caution' : 'bg-status-normal animate-pulse'}`}
              />
              {onlineLabel}
            </span>
            <button
              onClick={() => setConfirmClear(true)}
              disabled={messages.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-space-muted border border-space-border hover:text-status-critical hover:border-status-critical/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear chat
            </button>
          </div>
        </div>

        <div className="mt-3">
          <DataSharedBox />
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 min-h-0">
        <div className="max-w-3xl mx-auto space-y-4">
          {isEmpty ? (
            <EmptyState suggestions={suggestions} onSuggestion={handleSuggestion} loading={loading} />
          ) : (
            <>
              {showEmergency && <EmergencyBanner />}
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  <MessageBubble message={msg} />
                  {msg.role === 'assistant' && msg.id === lastAssistantId && !loading && (
                    <QuickActions onAlerts={() => navigate('/alerts')} />
                  )}
                </div>
              ))}
              {loading && <TypingIndicator />}
            </>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-space-border bg-space-surface/30 backdrop-blur-sm px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value.slice(0, MAX_INPUT));
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={loading}
                placeholder="Ask about your health data..."
                className="w-full resize-none rounded-xl bg-space-bg/60 border border-space-border focus:border-accent/50 px-4 py-3 text-sm text-space-text placeholder-space-muted/60 outline-none transition-colors disabled:opacity-50"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={loading || input.trim().length === 0}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-accent text-space-bg transition-all hover:shadow-[0_0_20px_var(--color-accent-glow)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-space-muted">Enter to send - Shift+Enter for new line</span>
            <span className="text-[10px] text-space-muted tabular-nums">
              {input.length}/{MAX_INPUT}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 sm:px-6 py-2 bg-space-bg border-t border-space-border">
        <p className="text-center text-[11px] text-space-muted leading-relaxed max-w-3xl mx-auto">
          Decision support only. Not a medical diagnosis. In an emergency follow mission procedures and contact the flight surgeon.
        </p>
      </div>

      <AnimatePresence>
        {confirmClear && (
          <ConfirmClearDialog
            onConfirm={() => {
              clearChat();
              setConfirmClear(false);
            }}
            onCancel={() => setConfirmClear(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EmergencyBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-4 rounded-xl bg-status-critical/15 border border-status-critical/40"
    >
      <AlertTriangle className="w-5 h-5 text-status-critical shrink-0" />
      <p className="text-sm font-semibold text-status-critical">
        This may be urgent. Follow mission emergency procedures and contact the flight surgeon now.
      </p>
    </motion.div>
  );
}

function QuickActions({ onAlerts }: { onAlerts: () => void }) {
  return (
    <div className="flex flex-wrap gap-2 pl-11">
      <button
        onClick={onAlerts}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-space-muted border border-space-border hover:text-accent hover:border-accent/40 transition-colors"
      >
        <ArrowRight className="w-3.5 h-3.5" />
        Open alerts
      </button>
      <button
        onClick={onAlerts}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-space-muted border border-space-border hover:text-status-critical hover:border-status-critical/40 transition-colors"
      >
        <Stethoscope className="w-3.5 h-3.5" />
        Prepare report for flight surgeon
      </button>
    </div>
  );
}

interface EmptyStateProps {
  suggestions: string[];
  onSuggestion: (text: string) => void;
  loading: boolean;
}

function EmptyState({ suggestions, onSuggestion, loading }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center py-8"
    >
      <div className="relative mb-6">
        <motion.div
          className="absolute inset-0 bg-accent/10 rounded-full blur-xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-space-surface border border-accent/20">
          <Bot className="w-7 h-7 text-accent" />
        </div>
      </div>
      <h2 className="text-lg font-semibold text-space-text mb-1.5">Welcome, Commander</h2>
      <p className="text-sm text-space-muted max-w-md mb-6">
        I can help you understand your health data, explain what the numbers mean, and suggest practical next steps. Try one of these questions:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl">
        {suggestions.map((s, i) => (
          <motion.button
            key={s}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            onClick={() => onSuggestion(s)}
            disabled={loading}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-space-surface border border-space-border text-sm text-space-text text-left transition-all hover:border-accent/40 hover:shadow-[0_0_16px_var(--color-accent-glow)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CircleCheck className="w-4 h-4 text-accent shrink-0" />
            <span>{s}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
