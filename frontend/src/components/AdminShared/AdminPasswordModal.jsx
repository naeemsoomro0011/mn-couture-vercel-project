import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import Loader3D from '../common/Loader3D';
import Portal from '../common/Portal';
import { updateAdminPassword } from '../../api/admin';
import './AdminShared.css';

const AdminPasswordModal = ({ open, onClose, onSuccess }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      await updateAdminPassword({ oldPassword, newPassword });
      onSuccess();
      close();
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
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
      </div>
    </div>
    </Portal>
  );
};

export default AdminPasswordModal;
