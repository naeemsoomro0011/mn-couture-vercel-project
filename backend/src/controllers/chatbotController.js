const ChatbotSession = require('../models/ChatbotSession');
const Item = require('../models/Item');
const catchAsync = require('../utils/catchAsync');
const { askGemini, streamGemini } = require('../services/geminiService');

const SYSTEM_PROMPT_BASE = `You are "MN Couture Assistant", a friendly AI shopping assistant for MN Couture, a premium clothing shop. The shop owner is Muhammad Naeem.

LANGUAGE
- Always reply in the SAME language/script the customer used. If they write Roman Urdu (Urdu typed in English letters), reply in Roman Urdu. If they write English, reply in English.

WHAT YOU ANSWER
- Only shop topics: items, sizes, prices, gender sections (men/women/kids/newborn), stock, shopping advice, shop timing and contact.
- If a question is unrelated to the shop, politely say it's outside this shop's topic and offer to help with clothing instead.

ITEM RULES (very important)
- The "Available Items" list below is the shop's ENTIRE stock. Never invent an item, a size, or a price.
- If the customer asks for something that is not in the list, say clearly that it isn't in stock right now, then suggest the closest available items from the list.
- Write every product name exactly like this: [[NAME]] — copied character-for-character from the "NAME:" field. That is what makes it a clickable link in the app.
- NEVER put a description (DESC) inside [[ ]] and never use a DESC as if it were the name.
- Every recommendation must contain at least one [[NAME]]. Naming an item without [[ ]] is wrong.

HOW TO ANSWER (this is what makes the reply feel complete)
- ALWAYS finish your answer. Never stop mid-sentence and never write a list number without the item after it.
- When the customer asks what is available (e.g. "shirt", "konsa", "kya hai"), list EVERY matching item from that section, each on its own line, in this shape:
  1. [[Item Name]] — Small Rs. 1,499 / Medium Rs. 1,599
  If there are more than 5 matches, show the best 5 and say how many more there are.
- When they ask for one specific thing, recommend 1-3 items with a one-line reason each.
- If a short answer fully answers the question, keep it short. Maximum ~120 words, warm and friendly, no long lectures.
- Prices are always in Rupees, written as "Rs. 1,499".
- If asked who owns the shop: Muhammad Naeem.`;

// The item list rarely changes between two chat messages, so it's cached very
// briefly — this removes a DB round-trip from the critical path of every reply.
let contextCache = { value: null, names: null, at: 0 };
const CONTEXT_TTL_MS = 30 * 1000;

const buildContext = async () => {
  if (contextCache.value && Date.now() - contextCache.at < CONTEXT_TTL_MS) {
    return { systemContext: contextCache.value, items: contextCache.names };
  }

  const items = await Item.find({}).select('name gender description sizes').limit(60).lean();

  // Each field is explicitly labelled so the model can never mistake the
  // caption/description for the product's actual name.
  const itemLines = items.map((i) => {
    const sizes = (i.sizes || []).map((s) => `${s.label} (Rs. ${s.price})`).join(', ');
    return `- NAME: ${i.name} | CATEGORY: ${i.gender} | SIZES: ${sizes} | DESC: ${i.description}`;
  });

  const itemsBlock = itemLines.length > 0 ? itemLines.join('\n') : '(No items have been added to the shop yet.)';
  const namesBlock = items.length > 0 ? items.map((i) => `[[${i.name}]]`).join(', ') : '(none)';
  const systemContext = `${SYSTEM_PROMPT_BASE}\n\nAvailable Items:\n${itemsBlock}\n\nThe ONLY valid link formats you may output are exactly these:\n${namesBlock}`;

  const names = items.map((i) => ({ name: i.name }));
  contextCache = { value: systemContext, names, at: Date.now() };
  return { systemContext, items: names };
};

/**
 * Safety net for the [[ ]] rules: if the model mentioned a real product name but
 * forgot the wrapper (or wrapped a description instead), fix it here so the
 * shopper still gets a working clickable item link.
 */
const linkifyItemNames = (text, items) => {
  let out = text;

  // 1. Unwrap anything bracketed that is NOT a real item name.
  out = out.replace(/\[\[(.+?)\]\]/g, (full, inner) => {
    const isReal = items.some((i) => i.name.toLowerCase() === inner.trim().toLowerCase());
    return isReal ? `[[${inner.trim()}]]` : inner.trim();
  });

  // 2. Wrap bare occurrences of real names (longest first, so "Kids Kurta Set"
  //    wins over "Kids Kurta"). Never double-wraps an already-linked name.
  [...items]
    .sort((a, b) => b.name.length - a.name.length)
    .forEach((item) => {
      const escaped = item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(?<!\\[\\[)\\b${escaped}\\b(?!\\]\\])`, 'gi');
      out = out.replace(re, `[[${item.name}]]`);
    });

  return out;
};

const STOP_WORDS = new Set(['hai', 'hain', 'the', 'a', 'an', 'is', 'are', 'ka', 'ki', 'ke', 'me', 'mein', 'kya', 'plz', 'please']);

/**
 * Chat titles used to cost a whole extra Gemini round-trip, which made the very
 * first reply feel slow. The subject of a shop chat is almost always in the
 * first message itself, so it's derived locally and instantly instead.
 */
const deriveTitle = (message) => {
  const cleaned = message.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleaned
    .split(' ')
    .filter((w) => w && !STOP_WORDS.has(w.toLowerCase()))
    .slice(0, 6);

  const base = (words.length ? words.join(' ') : cleaned) || 'New Chat';
  const title = base.length > 42 ? `${base.slice(0, 42).trim()}...` : base;
  return title.charAt(0).toUpperCase() + title.slice(1);
};

const sendMessage = catchAsync(async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
  }

  let session = null;
  let isNewSession = false;
  if (sessionId) {
    session = await ChatbotSession.findOne({ _id: sessionId, user: req.user._id });
  }
  if (!session) {
    session = await ChatbotSession.create({
      user: req.user._id,
      title: deriveTitle(message),
      messages: [],
    });
    isNewSession = true;
  }

  const history = session.messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    text: m.text,
  }));

  const { systemContext, items: allItems } = await buildContext();

  let replyText;
  try {
    replyText = await askGemini(message, systemContext, history);
    replyText = linkifyItemNames(replyText, allItems);
  } catch (err) {
    // Don't leave an orphaned empty session behind if this was a fresh chat.
    if (isNewSession) await ChatbotSession.deleteOne({ _id: session._id });
    return res.status(502).json({ success: false, message: err.message });
  }

  session.messages.push({ role: 'user', text: message });
  session.messages.push({ role: 'assistant', text: replyText });

  await session.save();

  res.status(200).json({ success: true, sessionId: session._id, reply: replyText, title: session.title });
});

/**
 * Streaming twin of sendMessage.
 *
 * The non-streaming call had to wait for Gemini to finish the *whole* answer
 * before the browser saw a single character, which is what made the assistant
 * feel slow. Here each token is pushed down an SSE connection the moment it
 * arrives, so the shopper watches the reply being typed out.
 *
 * Frames sent to the client:
 *   {"type":"chunk","text":"..."}                      — a new piece of the reply
 *   {"type":"done","reply":"...","sessionId","title"}  — final, link-ified reply
 *   {"type":"error","message":"..."}                   — something went wrong
 */
const streamMessage = async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // stops nginx-style proxies from buffering the stream
  });
  res.flushHeaders?.();

  const send = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  let session = null;
  let isNewSession = false;

  try {
    if (sessionId) {
      session = await ChatbotSession.findOne({ _id: sessionId, user: req.user._id });
    }
    if (!session) {
      session = await ChatbotSession.create({
        user: req.user._id,
        title: deriveTitle(message),
        messages: [],
      });
      isNewSession = true;
    }

    const history = session.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      text: m.text,
    }));

    const { systemContext, items: allItems } = await buildContext();

    let replyText = '';
    try {
      const { text } = await streamGemini(message, systemContext, history, (chunk) => {
        send({ type: 'chunk', text: chunk });
      });
      replyText = text;
    } catch (streamErr) {
      // SSE couldn't be established (old model alias, proxy, network) — fall
      // back to the normal request so the shopper still gets a real answer.
      if (!replyText) replyText = await askGemini(message, systemContext, history);
      else throw streamErr;
    }

    if (!replyText.trim()) {
      throw new Error('The assistant could not generate a reply. Please try again.');
    }

    replyText = linkifyItemNames(replyText, allItems);

    session.messages.push({ role: 'user', text: message });
    session.messages.push({ role: 'assistant', text: replyText });
    await session.save();

    send({ type: 'done', reply: replyText, sessionId: String(session._id), title: session.title });
    res.end();
  } catch (err) {
    if (isNewSession && session) {
      await ChatbotSession.deleteOne({ _id: session._id }).catch(() => {});
    }
    send({ type: 'error', message: err?.message || 'Something went wrong. Please try again.' });
    res.end();
  }
};

const getSessions = catchAsync(async (req, res) => {
  const sessions = await ChatbotSession.find({ user: req.user._id })
    .select('title updatedAt')
    .sort({ updatedAt: -1 });
  res.status(200).json({ success: true, sessions });
});

const getSession = catchAsync(async (req, res) => {
  const session = await ChatbotSession.findOne({ _id: req.params.id, user: req.user._id });
  if (!session) return res.status(404).json({ success: false, message: 'Chat not found.' });
  res.status(200).json({ success: true, session });
});

const deleteSession = catchAsync(async (req, res) => {
  await ChatbotSession.deleteOne({ _id: req.params.id, user: req.user._id });
  res.status(200).json({ success: true, message: 'Chat deleted.' });
});

module.exports = { sendMessage, streamMessage, getSessions, getSession, deleteSession };
