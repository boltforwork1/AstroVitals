import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecords } from '@/context/RecordsContext';
import { useAlerts } from '@/context/AlertsContext';
import { buildAssistantContext } from '@/utils/assistantContext';
import { getFallbackReply, isEmergency } from '@/utils/assistantFallback';

const STORAGE_KEY = 'astrovitals_chat';
const MAX_MESSAGES = 20;
const SEND_WINDOW = 10;
const TIMEOUT_MS = 25_000;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  offline?: boolean;
}

type OnlineState = 'online' | 'offline' | 'unknown';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(-MAX_MESSAGES);
    }
  } catch {
    // ignore
  }
  return [];
}

function saveMessages(msgs: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_MESSAGES)));
  } catch {
    // ignore
  }
}

export interface UseAssistantChat {
  messages: ChatMessage[];
  loading: boolean;
  isOnline: OnlineState;
  sendMessage: (text: string) => void;
  clearChat: () => void;
}

export function useAssistantChat(): UseAssistantChat {
  const { records } = useRecords();
  const { alerts } = useAlerts();
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState<OnlineState>('unknown');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || loading) return;

      const userMsg: ChatMessage = {
        id: uid(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg].slice(-MAX_MESSAGES));
      setLoading(true);

      const context = buildAssistantContext(records, alerts);
      const history = [...messages, userMsg]
        .slice(-SEND_WINDOW)
        .map((m) => ({ role: m.role, content: m.content }));

      const controller = new AbortController();
      abortRef.current = controller;
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, context }),
        signal: controller.signal,
      })
        .then(async (res) => {
          clearTimeout(timeout);
          if (!res.ok) throw new Error('non-200');
          const data = await res.json();
          if (!data || typeof data.reply !== 'string') throw new Error('no reply');
          setIsOnline('online');
          const assistantMsg: ChatMessage = {
            id: uid(),
            role: 'assistant',
            content: data.reply,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMsg].slice(-MAX_MESSAGES));
        })
        .catch(() => {
          clearTimeout(timeout);
          setIsOnline('offline');
          const reply = getFallbackReply(trimmed, records, alerts);
          const fallbackMsg: ChatMessage = {
            id: uid(),
            role: 'assistant',
            content: reply,
            timestamp: Date.now(),
            offline: true,
          };
          setMessages((prev) => [...prev, fallbackMsg].slice(-MAX_MESSAGES));
        })
        .finally(() => {
          setLoading(false);
          abortRef.current = null;
        });
    },
    [messages, loading, records, alerts]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, loading, isOnline, sendMessage, clearChat };
}

export function checkEmergency(text: string): boolean {
  return isEmergency(text);
}
