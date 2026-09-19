import { useState } from 'react';
import { FaTimes, FaPen, FaUpload, FaLink, FaKey } from 'react-icons/fa';
import Loader3D from '../common/Loader3D';
import Portal from '../common/Portal';
import OTPModal from '../AuthShared/OTPModal';
import UserPasswordModal from './UserPasswordModal';
import { useAuth } from '../../context/AuthContext';
import { uploadImage } from '../../utils/uploadImage';
import { updateMyProfile, requestMyEmailChange, confirmMyOldEmail, confirmMyNewEmail } from '../../api/userProfile';
import { alertSuccess } from '../../utils/alerts';
import '../AuthShared/AuthShared.css';
import '../../pages/UserAuth/UserAuth.css';
import './UserProfileModal.css';

const UserProfileModal = ({ open, onClose }) => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [form, setForm] = useState({ name: '', profilePic: '', newEmail: '' });
  const [picMode, setPicMode] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [otpStep, setOtpStep] = useState(null); // null | 'old' | 'new'
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  if (!open || !user) return null;

  const startEdit = () => {
    setForm({ name: user.name, profilePic: user.profilePic || '', newEmail: user.email });
    setEditing(true);
    setError('');
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, profilePic: url }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { data } = await updateMyProfile({ name: form.name, profilePic: form.profilePic });
      setUser(data.user);

      if (form.newEmail && form.newEmail.toLowerCase() !== user.email) {
        await requestMyEmailChange(form.newEmail);
        setOtpStep('old');
      } else {
        setEditing(false);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyOld = async (otp) => {
    setOtpError('');
    setOtpLoading(true);
    try {
      await confirmMyOldEmail(otp);
      setOtpStep('new');
    } catch (err) {
      setOtpError(err?.response?.data?.message || 'Wrong OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyNew = async (otp) => {
    setOtpError('');
    setOtpLoading(true);
    try {
      const { data } = await confirmMyNewEmail(otp);
      setUser(data.user);
      setOtpStep(null);
      setEditing(false);
    } catch (err) {
      setOtpError(err?.response?.data?.message || 'Wrong OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <Portal>
    <div className="modal-overlay anim-scale" onClick={onClose}>
      <div className="modal-card card-3d anim-up user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        {!editing ? (
          <div className="user-profile-view">
            <img src={user.profilePic || '/default-avatar.svg'} alt={user.name} className="user-profile-pic" />
            <h3>{user.name}</h3>
            <p className="user-profile-email">{user.email}</p>
            <div className="user-profile-actions-row">
              <button type="button" className="user-profile-edit-btn" onClick={startEdit} aria-label="Edit profile">
                <FaPen /> Edit
              </button>
              <button type="button" className="user-profile-edit-btn" onClick={() => setPasswordOpen(true)} aria-label="Change password">
                <FaKey /> Password
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-form">
            <h3 className="modal-title">Edit Profile</h3>
            <div className="auth-avatar-picker">
              {uploading ? (
                <Loader3D size={30} />
              ) : (
                <img src={form.profilePic || '/default-avatar.svg'} alt="" className="auth-avatar-preview" />
              )}
              <div className="auth-avatar-actions">
                <span className="auth-avatar-note">Profile Picture</span>
                <div className="auth-avatar-actions-row">
                  <label className="auth-avatar-action-btn">
                    <FaUpload /> Device
                    <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])} />
                  </label>
                  <button type="button" className="auth-avatar-action-btn" onClick={() => setPicMode((m) => (m === 'url' ? null : 'url'))}>
                    <FaLink /> URL
                  </button>
                </div>
                {picMode === 'url' && (
                  <input
                    type="text" className="auth-avatar-url-input"
                    value={form.profilePic} onChange={(e) => setForm({ ...form, profilePic: e.target.value })}
                  />
                )}
              </div>
            </div>

            <div className="field">
              <label>Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Email {form.newEmail !== user.email && <span style={{ color: 'var(--gold)' }}>(confirmation required)</span>}</label>
              <input type="email" required value={form.newEmail} onChange={(e) => setForm({ ...form, newEmail: e.target.value })} />
            </div>

            {error && <p className="field-error">{error}</p>}

            <div className="quickview-actions">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              {saving ? <Loader3D size={30} /> : <button type="submit" className="btn btn-primary">Save</button>}
            </div>
          </form>
        )}
      </div>

      <OTPModal
        open={otpStep === 'old'}
        email={user.email}
        title="Confirm Your Current Email"
        loading={otpLoading}
        error={otpError}
        onClose={() => setOtpStep(null)}
        onVerify={handleVerifyOld}
        onResend={() => {}}
      />
      <OTPModal
        open={otpStep === 'new'}
        email={form.newEmail}
        title="Confirm Your New Email"
        loading={otpLoading}
        error={otpError}
        onClose={() => setOtpStep(null)}
        onVerify={handleVerifyNew}
        onResend={() => {}}
      />

      <UserPasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSuccess={() => alertSuccess('Password Updated', 'Your password has been changed successfully.')}
      />
    </div>
    </Portal>
  );
};

export default UserProfileModal;
