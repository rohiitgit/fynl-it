import Groq from 'groq-sdk';

/**
 * Shared Groq client + model IDs.
 *
 * Groq exposes an OpenAI-compatible chat API. Models are pinned here so a
 * deprecation only needs a one-line change (Gemini broke because a retired
 * model id was hardcoded across multiple files).
 *
 * Verified current on GroqCloud (July 2026):
 *  - Vision: meta-llama/llama-4-scout-17b-16e-instruct (Maverick was deprecated)
 *  - Text:   llama-3.3-70b-versatile
 */
export const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
export const GROQ_TEXT_MODEL = 'llama-3.3-70b-versatile';

if (!process.env.GROQ_API_KEY) {
  // Surfaced at call time as a clean 500 rather than a cryptic SDK error.
  // (Not thrown at import so builds don't fail when the key is absent.)
  console.warn('[groq] GROQ_API_KEY is not set — AI features will fail until it is configured.');
}

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? '' });
