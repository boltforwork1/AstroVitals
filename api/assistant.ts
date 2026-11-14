import type { VercelRequest, VercelResponse } from '@vercel/node';

// ---------------------------------------------------------------------------
// Vercel Serverless Function: AstroVitals Assistant proxy
//
// Setup: set GEMINI_API_KEY in Vercel Project Settings > Environment Variables
// and redeploy. The Bolt preview cannot run Vercel functions, so locally the
// app falls back to offline mode.
//
// In-memory rate limiting is best-effort on serverless — each instance keeps
// its own counter and cold starts reset it. Good enough for a demo; use an
// external store (Upstash, Vercel KV) for production.
// ---------------------------------------------------------------------------

const MODEL = 'gemini-flash-latest';
const FALLBACK_MODEL = 'gemini-2.5-flash';
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

// Time budget: the frontend aborts requests after 25 s, so the whole function
// must finish in under 22 s. Each attempt has an 8 s timeout. With up to 3
// attempts plus 700 ms delays, worst case is 8 + 0.7 + 8 + 0.7 + 8 = 25.4 s,
// so we refuse to start a new attempt once 14 s have elapsed, leaving ~8 s for
// the final attempt to complete within the 22 s budget.
const ATTEMPT_TIMEOUT_MS = 8_000;
const RETRY_DELAY_MS = 700;
const NO_NEW_ATTEMPT_AFTER_MS = 14_000;
const RETRYABLE_STATUS = new Set([500, 503, 504]);

const SYSTEM_PROMPT = `You are AstroVitals Assistant, a health decision-support helper for astronauts on long-duration missions. You are NOT a doctor and you do not diagnose. Rules: 1) Answer in simple, plain language for non-experts, in 4-8 short sentences or a short list, in the user's language. 2) Use the crew data provided when relevant and say which indicator you are referring to. 3) Base explanations on well-established spaceflight health knowledge (NASA Human Research Program hazards: space radiation, isolation and confinement, distance from Earth, altered gravity, hostile and closed environments; fluid shifts, bone and muscle loss, sleep disruption, immune changes, vision changes, mood effects). 4) Give practical, low-risk actions such as sleep routine, exercise, hydration, breathing, crew contact. Never recommend specific drug names or doses. 5) If the user describes chest pain, trouble breathing, fainting, severe headache, sudden vision loss, confusion, thoughts of self-harm, or any emergency, tell them first to follow mission emergency procedures and contact the flight surgeon or ground support immediately. 6) If you are unsure or the question is outside spaceflight health, say so and suggest contacting the flight surgeon. 7) Never claim certainty and never invent numbers, studies, or sources. 8) Always end health-related answers with one short line: 'Decision support only, not a medical diagnosis.'`;

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages?: IncomingMessage[];
  context?: string;
}

const FALLBACK_REPLY =
  "I can't answer that safely. Please contact your flight surgeon if this is a health concern.";

// --- in-memory rate limiter (best-effort on serverless) ------------------
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  bucket.count++;
  return bucket.count <= RATE_LIMIT_MAX;
}

function getClientIp(req: VercelRequest): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string') return xff.split(',')[0].trim();
  if (Array.isArray(xff) && xff.length > 0) return xff[0].split(',')[0].trim();
  return 'unknown';
}

function validate(body: RequestBody): boolean {
  if (!Array.isArray(body.messages)) return false;
  if (body.messages.length === 0 || body.messages.length > 20) return false;
  for (const msg of body.messages) {
    if (msg === null || typeof msg !== 'object') return false;
    if (msg.role !== 'user' && msg.role !== 'assistant') return false;
    if (typeof msg.content !== 'string' || msg.content.length > 2000) return false;
  }
  if (body.context !== undefined) {
    if (typeof body.context !== 'string' || body.context.length > 4000) return false;
  }
  return true;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: { text: string }[];
}

function mapMessages(messages: IncomingMessage[]): GeminiContent[] {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  error?: { code?: number; message?: string };
}

function extractReply(data: GeminiResponse): string {
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts) return FALLBACK_REPLY;
  const text = parts.map((p) => p.text ?? '').join('').trim();
  return text || FALLBACK_REPLY;
}

interface GeminiAttemptResult {
  status: number;
  ok: boolean;
  reply: string | null;
}

async function callGemini(
  model: string,
  apiKey: string,
  contents: GeminiContent[],
  context: string
): Promise<GeminiAttemptResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT + '\n\nCurrent crew data (simulated demo data):\n' + context }],
        },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 700 },
      }),
      signal: controller.signal,
    });

    const data: GeminiResponse = await response.json();
    return {
      status: response.status,
      ok: response.ok,
      reply: response.ok ? extractReply(data) : null,
    };
  } catch {
    // Timeout (abort) or network failure — treat as a retryable failure.
    return { status: 0, ok: false, reply: null };
  } finally {
    clearTimeout(timeout);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'missing_api_key' });
    return;
  }

  if (!rateLimit(getClientIp(req))) {
    res.status(429).json({ error: 'rate_limited' });
    return;
  }

  const body: RequestBody = req.body ?? {};
  if (!validate(body)) {
    res.status(400).json({ error: 'invalid_request' });
    return;
  }

  const context = body.context ?? '';
  const contents = mapMessages(body.messages);

  const start = Date.now();

  // Attempt sequence:
  //   1. MODEL
  //   2. MODEL  (after 700 ms) — only if 5xx / timeout / network error
  //   3. FALLBACK_MODEL  (after 700 ms) — only if 5xx / timeout / network error / 404
  const attempts: { model: string }[] = [
    { model: MODEL },
    { model: MODEL },
    { model: FALLBACK_MODEL },
  ];

  let lastStatus = 0;

  for (let i = 0; i < attempts.length; i++) {
    // Don't start a new attempt if we're past the time budget.
    if (Date.now() - start > NO_NEW_ATTEMPT_AFTER_MS) {
      break;
    }

    const { model } = attempts[i];

    // On a 404, skip remaining MODEL retries and go straight to the fallback.
    if (lastStatus === 404 && model === MODEL && i < attempts.length - 1) {
      continue;
    }

    const result = await callGemini(model, apiKey, contents, context);
    lastStatus = result.status;

    if (result.ok && result.reply !== null) {
      res.status(200).json({ reply: result.reply, model });
      return;
    }

    // 429 — stop immediately, surface a quota error to the client.
    if (result.status === 429) {
      res.status(429).json({ error: 'quota_exceeded' });
      return;
    }

    // 400 / 401 / 403 — client or auth errors, no point retrying.
    if (result.status === 400 || result.status === 401 || result.status === 403) {
      console.error(`gemini ${model} status ${result.status}`);
      res.status(502).json({ error: 'upstream_error' });
      return;
    }

    // 404 — model not found; loop will skip to FALLBACK_MODEL on next iteration.
    // 500 / 503 / 504 / timeout (status 0) / network error — retryable.
    if (result.status !== 404 && !RETRYABLE_STATUS.has(result.status)) {
      // Unexpected non-retryable status — bail out.
      console.error(`gemini ${model} status ${result.status}`);
      res.status(502).json({ error: 'upstream_error' });
      return;
    }

    if (result.status !== 0) {
      console.error(`gemini ${model} status ${result.status}`);
    }

    // Wait before the next attempt (unless this was the last one).
    if (i < attempts.length - 1) {
      await sleep(RETRY_DELAY_MS);
    }
  }

  // All attempts exhausted with 5xx / timeouts / network errors.
  res.status(503).json({ error: 'upstream_unavailable' });
}
