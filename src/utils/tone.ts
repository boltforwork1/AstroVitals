import type { JournalEntry } from '@/context/WellbeingContext';

export type Tone = 'positive' | 'neutral' | 'low';

// Simple keyword heuristic for demo purposes, not a clinical tool.
const POSITIVE_WORDS = [
  'grateful', 'proud', 'excited', 'calm', 'happy', 'good', 'enjoyed', 'hopeful',
];

const LOW_WORDS = [
  'tired', 'alone', 'lonely', 'anxious', 'stressed', 'sad', 'homesick',
  'hopeless', 'irritated', 'overwhelmed', 'exhausted',
];

function countMatches(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  return words.reduce((count, word) => {
    const re = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lower.match(re);
    return count + (matches ? matches.length : 0);
  }, 0);
}

export function analyzeTone(text: string): { tone: Tone; score: number } {
  const positive = countMatches(text, POSITIVE_WORDS);
  const low = countMatches(text, LOW_WORDS);

  if (positive > low) return { tone: 'positive', score: positive };
  if (low > positive) return { tone: 'low', score: low };
  return { tone: 'neutral', score: 0 };
}

export function detectIsolationSignals(entries: JournalEntry[]): boolean {
  const last5 = entries.slice(-5);
  if (last5.length < 3) return false;
  const lowCount = last5.filter((e) => e.tone === 'low').length;
  return lowCount >= 3;
}

export const TONE_COLOR: Record<Tone, string> = {
  positive: '#22C55E',
  neutral: '#8A97B5',
  low: '#F59E0B',
};
