import api from './axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/** Plain request/response — used as the fallback when streaming isn't available. */
export const sendChatMessage = async (message, sessionId) => {
  const { data } = await api.post('/chatbot/message', { message, sessionId });
  return data;
};

/**
 * Streamed reply (Server-Sent Events).
 *
 * The assistant used to look frozen because nothing appeared until the whole
 * answer was ready. Here every piece of text is handed to `onChunk` the moment
 * the server produces it, so the reply types itself out like a real AI chat.
 *
 * Resolves with { reply, sessionId, title } once the stream finishes.
 * Throws on any transport failure so the caller can fall back to sendChatMessage.
 */
export const streamChatMessage = async (message, sessionId, onChunk) => {
  const response = await fetch(`${API_BASE}/chatbot/message/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // sends the httpOnly auth cookie, same as axios
    body: JSON.stringify({ message, sessionId }),
  });

  if (!response.ok || !response.body) {
    let reason = 'Could not reach the assistant.';
    try {
      reason = (await response.json())?.message || reason;
    } catch {
      /* not JSON — keep the generic message */
    }
    const err = new Error(reason);
    err.status = response.status;
    throw err;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let streamed = '';
  let result = null;
  let serverError = null;

  const consumeFrame = (frame) => {
    const line = frame.split('\n').find((l) => l.startsWith('data:'));
    if (!line) return;

    let payload;
    try {
      payload = JSON.parse(line.slice(5).trim());
    } catch {
      return;
    }

    if (payload.type === 'chunk' && payload.text) {
      streamed += payload.text;
      onChunk?.(streamed);
    } else if (payload.type === 'done') {
      result = { reply: payload.reply, sessionId: payload.sessionId, title: payload.title };
    } else if (payload.type === 'error') {
      serverError = new Error(payload.message || 'Something went wrong. Please try again.');
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let split;
    while ((split = buffer.indexOf('\n\n')) !== -1) {
      consumeFrame(buffer.slice(0, split));
      buffer = buffer.slice(split + 2);
    }
  }
  if (buffer.trim()) consumeFrame(buffer);

  if (serverError) {
    // The server answered, it just couldn't produce a reply — don't retry the
    // whole thing over the non-streaming route, surface the real reason.
    serverError.handled = true;
    throw serverError;
  }
  if (!result) throw new Error('The assistant closed the connection early.');

  return result;
};

export const fetchChatSessions = async () => {
  const { data } = await api.get('/chatbot/sessions');
  return data.sessions;
};

export const fetchChatSession = async (id) => {
  const { data } = await api.get(`/chatbot/sessions/${id}`);
  return data.session;
};

export const deleteChatSession = async (id) => {
  await api.delete(`/chatbot/sessions/${id}`);
};
