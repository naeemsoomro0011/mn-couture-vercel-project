import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaPlus, FaTrash, FaBars, FaTimes, FaRobot, FaUser } from 'react-icons/fa';
import {
  sendChatMessage, streamChatMessage, fetchChatSessions, fetchChatSession, deleteChatSession,
} from '../../api/chatbot';
import { fetchItems } from '../../api/items';
import { useAuth } from '../../context/AuthContext';
import Loader3D from '../common/Loader3D';
import { alertConfirm } from '../../utils/alerts';
import './Chat.css';

// Assistant replies mark item suggestions as [[Item Name]] (see the backend's
// system prompt) — this turns those into buttons that scroll to the card.
const renderMessageText = (text, itemMap) => {
  const parts = text.split(/(\[\[.*?\]\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[\[(.*?)\]\]$/);
    if (match) {
      const name = match[1];
      const id = itemMap[name.toLowerCase()];
      if (id) {
        return (
          <button
            key={i}
            type="button"
            className="chat-item-link"
            onClick={() => document.getElementById(`item-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          >
            {name}
          </button>
        );
      }
      return <strong key={i}>{name}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

// Same fallback used by the Navbar avatar, so a name like "Ayesha Khan"
// becomes "AK" whenever the person has no profile picture set.
const initials = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

const ChatWidget = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [itemMap, setItemMap] = useState({});
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchChatSessions().then(setSessions).catch(() => setSessions([]));
    fetchItems()
      .then((items) => {
        const map = {};
        items.forEach((i) => { map[i.name.toLowerCase()] = i._id; });
        setItemMap(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending, streamingText]);

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const openSession = async (id) => {
    setSidebarOpen(false);
    const session = await fetchChatSession(id);
    setActiveSessionId(session._id);
    setMessages(session.messages);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const confirmed = await alertConfirm('Delete This Chat?', 'Yeh chat hamesha ke liye delete ho jayegi.', 'Delete');
    if (!confirmed) return;
    await deleteChatSession(id);
    setSessions((prev) => prev.filter((s) => s._id !== id));
    if (activeSessionId === id) startNewChat();
  };

  // Moves the just-used chat to the top of the history list.
  const touchSession = (id, title) => {
    if (!activeSessionId) {
      setActiveSessionId(id);
      setSessions((prev) => [{ _id: id, title, updatedAt: new Date().toISOString() }, ...prev]);
      return;
    }
    setSessions((prev) => {
      const current = prev.find((s) => s._id === activeSessionId);
      const rest = prev.filter((s) => s._id !== activeSessionId);
      return current ? [{ ...current, updatedAt: new Date().toISOString() }, ...rest] : prev;
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setSending(true);
    setStreamingText('');

    let result = null;
    let failure = null;

    // 1. Preferred path: stream the answer so it types itself out live.
    try {
      result = await streamChatMessage(text, activeSessionId, setStreamingText);
    } catch (err) {
      if (err?.handled) {
        // The server replied properly, it just couldn't generate an answer —
        // retrying over the plain route would only repeat the same failure.
        failure = err.message;
      } else {
        // 2. Transport/browser couldn't stream — fall back to the normal call.
        try {
          const data = await sendChatMessage(text, activeSessionId);
          result = { reply: data.reply, sessionId: data.sessionId, title: data.title };
        } catch (err2) {
          failure = err2?.response?.data?.message || 'Sorry, something went wrong. Please try again.';
        }
      }
    }

    setStreamingText('');

    if (result) {
      setMessages((prev) => [...prev, { role: 'assistant', text: result.reply }]);
      touchSession(result.sessionId, result.title);
    } else {
      setMessages((prev) => [...prev, { role: 'assistant', text: failure }]);
    }

    setSending(false);
  };

  return (
    <div className="chat-widget card-3d">
      <aside className={`chat-sidebar ${sidebarOpen ? 'chat-sidebar-open' : ''}`}>
        <button type="button" className="btn btn-primary chat-new-btn" onClick={startNewChat}>
          <FaPlus /> New Chat
        </button>
        <div className="chat-sessions-list">
          {sessions.map((s) => (
            <div
              key={s._id}
              className={`chat-session-item ${activeSessionId === s._id ? 'chat-session-active' : ''}`}
              onClick={() => openSession(s._id)}
            >
              <span>{s.title}</span>
              <button type="button" className="chat-session-delete" onClick={(e) => handleDelete(s._id, e)} aria-label="Delete chat">
                <FaTrash />
              </button>
            </div>
          ))}
          {sessions.length === 0 && <p className="chat-sidebar-empty">No past chats yet.</p>}
        </div>
      </aside>

      <div className="chat-main">
        <button type="button" className="chat-mobile-toggle" onClick={() => setSidebarOpen((o) => !o)}>
          {sidebarOpen ? <FaTimes /> : <FaBars />} History
        </button>

        <div className="chat-messages" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="chat-empty-state">
              <FaRobot />
              <p>Hi {user?.name}! Tell me what kind of clothing you're looking for.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble-row ${m.role === 'user' ? 'chat-bubble-row-user' : ''}`}>
              <span className={`chat-avatar ${m.role === 'user' ? 'chat-avatar-user' : 'chat-avatar-bot'}`}>
                {m.role === 'user' ? (
                  user?.profilePic ? (
                    <img src={user.profilePic} alt={user?.name || 'You'} className="chat-avatar-img" />
                  ) : (
                    initials(user?.name) || <FaUser />
                  )
                ) : (
                  <FaRobot />
                )}
              </span>
              <div className="chat-bubble">{renderMessageText(m.text, itemMap)}</div>
            </div>
          ))}
          {sending && (
            <div className="chat-bubble-row">
              <span className="chat-avatar chat-avatar-bot"><FaRobot /></span>
              {streamingText ? (
                <div className="chat-bubble chat-bubble-streaming">
                  {renderMessageText(streamingText, itemMap)}
                  <span className="chat-caret" aria-hidden="true" />
                </div>
              ) : (
                <div className="chat-bubble chat-bubble-loading"><Loader3D size={22} /></div>
              )}
            </div>
          )}
        </div>

        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="chat-send-btn" disabled={!input.trim() || sending} aria-label="Send">
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWidget;
