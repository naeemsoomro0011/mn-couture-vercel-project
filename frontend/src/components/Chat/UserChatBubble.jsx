import { useState, useEffect, useRef } from 'react';
import { FaCommentDots, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { fetchMyMessages, sendMyMessage } from '../../api/messages';
import socket from '../../socket';
import Loader3D from '../common/Loader3D';
import Portal from '../common/Portal';
import '../Chat/Chat.css';
import './UserChatBubble.css';

const UserChatBubble = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const scrollRef = useRef(null);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    if (!user) return;
    socket.connect();
    socket.emit('join', { role: 'user', userId: user.id });

    const handler = (msg) => {
      const msgUserId = typeof msg.user === 'string' ? msg.user : msg.user?._id;
      if (msgUserId !== user.id) return;
      // Guard against double-adding a message we already have (e.g. one
      // that arrived via the open-panel refetch just before the socket event).
      setMessages((prev) => {
        if (!prev) return [msg];
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      if (msg.sender === 'admin' && !openRef.current) setHasUnread(true);
    };
    socket.on('newMessage', handler);

    return () => socket.off('newMessage', handler);
  }, [user]);

  // Refetch every time the panel opens — not just the first time — so any
  // admin reply sent while this tab was closed/backgrounded is never missed.
  useEffect(() => {
    if (open) {
      setHasUnread(false);
      fetchMyMessages().then(setMessages).catch(() => setMessages((prev) => prev || []));
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    try {
      await sendMyMessage(text); // the socket event appends it — avoids duplicates
    } finally {
      setSending(false);
    }
  };

  return (
    <Portal>
      <button type="button" className="user-chat-fab" onClick={() => setOpen((o) => !o)} aria-label="Chat with the shop">
        {open ? <FaTimes /> : <FaCommentDots />}
        {hasUnread && !open && <span className="user-chat-fab-dot" />}
      </button>

      {open && (
        <div className="user-chat-panel card-3d anim-scale">
          <div className="user-chat-header">Chat with MN Couture</div>

          <div className="user-chat-messages">
            {messages === null && <Loader3D size={26} />}
            {messages?.length === 0 && <p className="chat-sidebar-empty">No messages yet — send us a question to get started.</p>}
            {messages?.map((m) => (
              <div key={m._id} className={`chat-bubble-row ${m.sender === 'user' ? 'chat-bubble-row-user' : ''}`}>
                <div className="chat-bubble">{m.text}</div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <input placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} />
            <button type="submit" className="chat-send-btn" disabled={!input.trim() || sending} aria-label="Send">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </Portal>
  );
};

export default UserChatBubble;
