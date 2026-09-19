import { FaRobot } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BlobBackground from '../common/BlobBackground';
import ChatWidget from './ChatWidget';
import './Chat.css';

const ChatSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section id="ai-chat" className="chat-section">
      <BlobBackground variant="chat" />
      <div className="container chat-section-inner">
        <p className="home-eyebrow">AI Shopping Assistant</p>
        <h2>Chat with the MN Couture Assistant</h2>
        <p className="chat-section-desc">
          Tell us your preferences — age, gender, size, color — and our AI assistant will
          suggest the best items for you from our shop. Chat in any language and we'll
          reply in the same one.
        </p>

        {user ? (
          <ChatWidget />
        ) : (
          <div className="chat-login-card card-3d anim-scale">
            <FaRobot className="chat-login-icon" />
            <p>You need to log in to chat with the AI assistant.</p>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Log In
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ChatSection;
