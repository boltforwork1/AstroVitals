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
const UPSTREAM_TIMEOUT_MS = 20_000;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

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

async function callGemini(
  model: string,
  apiKey: string,
  contents: GeminiContent[],
  context: string
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    return await fetch(url, {
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
  } finally {
    clearTimeout(timeout);
  }
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

  try {
    let response = await callGemini(MODEL, apiKey, contents, context);
    let data: GeminiResponse = await response.json();

    // Retry once with fallback model on 404 / model-not-found
    if (response.status === 404 || data.error?.code === 404) {
      response = await callGemini(FALLBACK_MODEL, apiKey, contents, context);
      data = await response.json();
    }

    if (response.status === 429) {
      res.status(429).json({ error: 'upstream_error' });
      return;
    }

    if (!response.ok) {
      res.status(502).json({ error: 'upstream_error' });
      return;
    }

    res.status(200).json({ reply: extractReply(data) });
  } catch (err) {
    // AbortController timeout or network failure — never leak details
    res.status(502).json({ error: 'upstream_error' });
  }
}
