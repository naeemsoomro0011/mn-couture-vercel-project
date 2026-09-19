/**
 * Thin wrapper around Google's FREE Gemini API (AI Studio).
 * Get a free key (no credit card needed): https://aistudio.google.com/apikey
 * IMPORTANT: never enable billing on that Google Cloud project — doing so
 * removes the free tier entirely and every call starts getting billed.
 *
 * Used by the shop's AI chat assistant: the chat controller fetches the real
 * items from MongoDB and passes them in `systemContext` so Gemini only ever
 * recommends real, in-stock products.
 *
 * Two things here matter a lot for reply quality/speed:
 *  1. "Thinking" is switched OFF. On flash models the hidden reasoning tokens
 *     are billed against maxOutputTokens, which is exactly what made replies
 *     stop halfway ("...yeh options available hain: 1.") and take many
 *     seconds. With thinking off the reply comes back fast and complete.
 *  2. ALL text parts are joined. Taking only parts[0] silently dropped the
 *     rest of a multi-part answer — another source of half replies.
 */
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}`;
const GEMINI_URL = `${GEMINI_BASE}:generateContent`;
const GEMINI_STREAM_URL = `${GEMINI_BASE}:streamGenerateContent`;
const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 25000);
const STREAM_TIMEOUT_MS = Number(process.env.GEMINI_STREAM_TIMEOUT_MS || 45000);

/** Joins every text part of the first candidate, skipping hidden "thought" parts. */
const extractReply = (data) => {
  const candidate = data?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  const text = parts
    .filter((p) => p && typeof p.text === 'string' && p.thought !== true)
    .map((p) => p.text)
    .join('')
    .trim();
  return { text, finishReason: candidate?.finishReason || '' };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** One HTTP call with a hard timeout so a hanging request can't freeze the chat. */
const callGemini = async (body) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const raw = await response.text();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch {
      /* non-JSON error body — handled below */
    }

    if (!response.ok) {
      const err = new Error(data?.error?.message || `Gemini API error: ${response.status}`);
      err.status = response.status;
      throw err;
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('The assistant took too long to respond. Please try again.');
      timeoutErr.status = 504;
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

const assertKey = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('paste_your')) {
    throw new Error('GEMINI_API_KEY is not set. Add your free key to .env: https://aistudio.google.com/apikey');
  }
};

/**
 * Shared request body. Only the recent turns are sent — a huge history slows
 * every reply down and adds nothing useful to a shopping chat.
 */
const makeBodyBuilder = (userMessage, systemContext, history, options) => {
  const trimmedHistory = history.slice(-12);

  const contents = [
    ...trimmedHistory.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  return (thinkingOff, maxOutputTokens) => {
    const generationConfig = {
      temperature: options.temperature ?? 0.55,
      topP: 0.9,
      maxOutputTokens,
    };
    // Flash models: budget 0 = no hidden reasoning tokens = fast, complete answers.
    if (thinkingOff) generationConfig.thinkingConfig = { thinkingBudget: 0 };
    return {
      contents,
      systemInstruction: { parts: [{ text: systemContext }] },
      generationConfig,
    };
  };
};

/**
 * Non-streaming reply — used as the fallback when SSE isn't available.
 *
 * @param {string} userMessage - what the shopper typed (any language)
 * @param {string} systemContext - shop rules + relevant product data to ground the reply
 * @param {Array<{role: 'user'|'model', text: string}>} history - prior turns in this session
 * @param {{ maxOutputTokens?: number, temperature?: number }} [options]
 */
const askGemini = async (userMessage, systemContext, history = [], options = {}) => {
  assertKey();
  const buildBody = makeBodyBuilder(userMessage, systemContext, history, options);

  const maxTokens = options.maxOutputTokens ?? 1100;
  let data;
  let thinkingOff = true;

  try {
    data = await callGemini(buildBody(thinkingOff, maxTokens));
  } catch (err) {
    if (err.status === 400) {
      // Some model versions reject thinkingConfig outright — retry plainly.
      thinkingOff = false;
      data = await callGemini(buildBody(thinkingOff, maxTokens));
    } else if (err.status === 429 || err.status === 500 || err.status === 503) {
      await sleep(900);
      data = await callGemini(buildBody(thinkingOff, maxTokens));
    } else {
      throw err;
    }
  }

  let { text, finishReason } = extractReply(data);

  // Safety net: empty body (budget eaten) or a cut-off reply — ask once more with
  // a bigger ceiling so the shopper never sees half a sentence.
  if (!text || finishReason === 'MAX_TOKENS') {
    try {
      const retry = await callGemini(buildBody(thinkingOff, Math.min(maxTokens * 2, 2048)));
      const retryOut = extractReply(retry);
      if (retryOut.text && retryOut.text.length > text.length) text = retryOut.text;
    } catch {
      /* keep whatever we already have */
    }
  }

  if (!text) throw new Error('The assistant could not generate a reply. Please try again.');

  return text;
};

/**
 * Server-Sent-Events version of askGemini.
 *
 * This is the reason the assistant now *feels* instant: instead of waiting for
 * the whole answer and then showing it, every token Gemini produces is handed
 * straight to `onChunk`, which the controller forwards to the browser. The
 * shopper starts reading after ~300ms rather than after several seconds.
 *
 * @param {(text: string) => void} onChunk - called with each new piece of text
 * @returns {Promise<{ text: string, finishReason: string }>} the full reply
 */
const streamGemini = async (userMessage, systemContext, history = [], onChunk, options = {}) => {
  assertKey();

  const buildBody = makeBodyBuilder(userMessage, systemContext, history, options);
  const maxTokens = options.maxOutputTokens ?? 1100;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${GEMINI_STREAM_URL}?alt=sse&key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody(true, maxTokens)),
        signal: controller.signal,
      }
    );

    if (!response.ok || !response.body) {
      const raw = await response.text().catch(() => '');
      let message = `Gemini API error: ${response.status}`;
      try {
        message = JSON.parse(raw)?.error?.message || message;
      } catch {
        /* keep the status message */
      }
      const err = new Error(message);
      err.status = response.status;
      throw err;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let full = '';
    let finishReason = '';

    // Gemini's SSE stream is one `data: {json}` per line.
    const consumeLine = (line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) return;

      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') return;

      let data;
      try {
        data = JSON.parse(payload);
      } catch {
        return; // a malformed/partial frame — the next one will carry the text
      }

      const candidate = data?.candidates?.[0];
      if (candidate?.finishReason) finishReason = candidate.finishReason;

      const text = (candidate?.content?.parts || [])
        .filter((p) => p && typeof p.text === 'string' && p.thought !== true)
        .map((p) => p.text)
        .join('');

      if (text) {
        full += text;
        if (typeof onChunk === 'function') onChunk(text);
      }
    };

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        consumeLine(buffer.slice(0, newlineIndex));
        buffer = buffer.slice(newlineIndex + 1);
      }
    }
    if (buffer) consumeLine(buffer);

    return { text: full.trim(), finishReason };
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('The assistant took too long to respond. Please try again.');
      timeoutErr.status = 504;
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

module.exports = { askGemini, streamGemini };
