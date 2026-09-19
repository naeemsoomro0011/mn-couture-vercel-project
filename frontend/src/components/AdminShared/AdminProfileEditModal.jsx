import { useState, useEffect } from 'react';
import { FaTimes, FaUpload, FaLink } from 'react-icons/fa';
import Loader3D from '../common/Loader3D';
import Portal from '../common/Portal';
import OTPModal from '../AuthShared/OTPModal';
import { uploadImage } from '../../utils/uploadImage';
import { updateAdminProfile, requestAdminEmailChange, confirmAdminOldEmail, confirmAdminNewEmail } from '../../api/admin';
import '../AuthShared/AuthShared.css';
import '../../pages/UserAuth/UserAuth.css';
import './AdminShared.css';

// Email changes go through 2 OTP steps: one to the OLD email (proves this is
// really the account owner), then one to the NEW email (proves they own it).
const AdminProfileEditModal = ({ open, admin, onClose, onUpdated }) => {
  const [form, setForm] = useState({ name: '', profilePic: '', number: '', whatsappNumber: '', newEmail: '' });
  const [picMode, setPicMode] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [otpStep, setOtpStep] = useState(null); // null | 'old' | 'new'
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    if (open && admin) {
      setForm({
        name: admin.name,
        profilePic: admin.profilePic || '',
        number: admin.number || '',
        whatsappNumber: admin.whatsappNumber || '',
        newEmail: admin.email,
      });
      setError('');
      setOtpStep(null);
    }
  }, [open, admin]);

  if (!open) return null;

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
      const { data } = await updateAdminProfile({
        name: form.name,
        profilePic: form.profilePic,
        number: form.number,
        whatsappNumber: form.whatsappNumber,
      });
      onUpdated(data.admin);

      if (form.newEmail && form.newEmail.toLowerCase() !== admin.email) {
        await requestAdminEmailChange(form.newEmail);
        setOtpStep('old');
      } else {
        onClose();
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
      await confirmAdminOldEmail(otp);
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
      const { data } = await confirmAdminNewEmail(otp);
      onUpdated(data.admin);
      setOtpStep(null);
      onClose();
    } catch (err) {
      setOtpError(err?.response?.data?.message || 'Wrong OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <Portal>
    <div className="modal-overlay anim-scale" onClick={onClose}>
      <div className="modal-card card-3d anim-up admin-form-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <h3 className="modal-title">Edit Profile</h3>

        <form onSubmit={handleSubmit} className="admin-form">
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

          <div className="field"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Number</label><input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /></div>
          <div className="field"><label>WhatsApp Number</label><input value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} /></div>
          <div className="field">
            <label>Email {form.newEmail !== admin.email && <span style={{ color: 'var(--gold)' }}>(changing this requires confirmation)</span>}</label>
            <input type="email" required value={form.newEmail} onChange={(e) => setForm({ ...form, newEmail: e.target.value })} />
          </div>

          {error && <p className="field-error">{error}</p>}

          {saving ? <Loader3D size={32} /> : (
            <button type="submit" className="btn btn-primary modal-submit-btn">Save</button>
          )}
        </form>
      </div>

      <OTPModal
        open={otpStep === 'old'}
        email={admin.email}
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
    </div>
    </Portal>
  );
};

export default AdminProfileEditModal;
