import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import { fetchAdminThread, sendAdminMessage } from '../../api/admin';
import socket from '../../socket';
import Loader3D from '../common/Loader3D';
import Portal from '../common/Portal';
import '../Chat/Chat.css';
import './AdminShared.css';

const AdminChatModal = ({ open, targetUser, onClose }) => {
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    socket.connect();
    socket.emit('join', { role: 'admin' });
  }, []);

  useEffect(() => {
    if (open && targetUser) {
      setMessages(null);
      fetchAdminThread(targetUser._id).then(setMessages).catch(() => setMessages([]));

      const handler = (msg) => {
        const msgUserId = typeof msg.user === 'string' ? msg.user : msg.user?._id;
        if (msgUserId !== targetUser._id) return;
        setMessages((prev) => {
          if (!prev) return [msg];
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      };
      socket.on('newMessage', handler);
      return () => socket.off('newMessage', handler);
    }
  }, [open, targetUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!open || !targetUser) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setSending(true);
    setInput('');
    try {
      await sendAdminMessage(targetUser._id, text); // socket event appends it
    } finally {
      setSending(false);
    }
  };

  return (
    <Portal>
    <div className="modal-overlay anim-scale" onClick={onClose}>
      <div className="modal-card card-3d anim-up admin-chat-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <h3 className="modal-title">Chat with {targetUser.name}</h3>

        <div className="admin-chat-messages">
          {messages === null && <Loader3D label="Loading..." />}
          {messages?.length === 0 && <p className="chat-sidebar-empty">No messages yet — write a reply to get started.</p>}
          {messages?.map((m) => (
            <div key={m._id} className={`chat-bubble-row ${m.sender === 'admin' ? 'chat-bubble-row-user' : ''}`}>
              <div className="chat-bubble">{m.text}</div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <form className="chat-input-row" onSubmit={handleSend}>
          <input placeholder="Type a reply..." value={input} onChange={(e) => setInput(e.target.value)} />
          <button type="submit" className="chat-send-btn" disabled={!input.trim() || sending} aria-label="Send">
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
    </Portal>
  );
};

export default AdminChatModal;
