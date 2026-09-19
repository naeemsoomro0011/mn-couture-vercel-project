import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import Loader3D from '../common/Loader3D';
import Portal from '../common/Portal';
import ForgotPasswordModal from '../AuthShared/ForgotPasswordModal';
import { updateMyPassword } from '../../api/userProfile';
import api from '../../api/axios';
import './UserProfileModal.css';

const UserPasswordModal = ({ open, onClose, onSuccess }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  if (!open) return null;

  const close = () => {
    setOldPassword('');
    setNewPassword('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateMyPassword({ oldPassword, newPassword });
      onSuccess();
      close();
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Portal>
        <div className="modal-overlay anim-scale" onClick={close}>
          <div className="modal-card card-3d anim-up" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={close} aria-label="Close">
              <FaTimes />
            </button>
            <h3 className="modal-title">Update Password</h3>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Old Password</label>
                <input type="password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              </div>
              <div className="field">
                <label>New Password</label>
                <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              {error && <p className="field-error">{error}</p>}
              {saving ? (
                <Loader3D size={30} />
              ) : (
                <button type="submit" className="btn btn-primary modal-submit-btn">Update Password</button>
              )}
            </form>

            <button type="button" className="modal-resend-btn" onClick={() => setForgotOpen(true)}>
              Forgot your old password? Reset with OTP
            </button>
          </div>
        </div>
      </Portal>

      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onRequestOTP={(email) => api.post('/auth/forgot-password', { email })}
        onResetPassword={(payload) => api.post('/auth/reset-password', payload)}
      />
    </>
  );
};

export default UserPasswordModal;
