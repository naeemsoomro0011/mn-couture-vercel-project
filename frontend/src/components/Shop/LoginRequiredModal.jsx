import { FaTimes, FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Portal from '../common/Portal';
import './Shop.css';

const LoginRequiredModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  if (!open) return null;

  return (
    <Portal>
    <div className="modal-overlay anim-scale" onClick={onClose}>
      <div className="modal-card card-3d anim-up" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <FaHeart className="login-required-icon" />
        <h3 className="modal-title">Login Required</h3>
        <p className="modal-subtitle">
          This is for your security, please don't be offended — just one small
          step and you can start shopping.
        </p>
        <button className="btn btn-primary modal-submit-btn" onClick={() => navigate('/login')}>
          Log In
        </button>
      </div>
    </div>
    </Portal>
  );
};

export default LoginRequiredModal;
