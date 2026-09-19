import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaLink } from 'react-icons/fa';
import AuthLayout from '../../components/AuthShared/AuthLayout';
import OTPModal from '../../components/AuthShared/OTPModal';
import Loader3D from '../../components/common/Loader3D';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { uploadImage } from '../../utils/uploadImage';
import { alertSuccess, alertError } from '../../utils/alerts';
import './UserAuth.css';

const Signup = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [profilePic, setProfilePic] = useState('');
  const [picMode, setPicMode] = useState(null); // null | 'device' | 'url'
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [otpOpen, setOtpOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setProfilePic(url);
    } catch {
      alertError('Upload Failed', 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/register', { ...form, profilePic });
      setOtpOpen(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (otp) => {
    setOtpError('');
    setOtpLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email: form.email, otp });
      setUser(data.user);
      setOtpOpen(false);
      alertSuccess('Account Created!', 'Welcome to MN Couture.');
      navigate('/');
    } catch (err) {
      setOtpError(err?.response?.data?.message || 'Wrong OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email: form.email, purpose: 'verify-email' });
      alertSuccess('OTP Sent', 'Please check your email.');
    } catch {
      alertError('Could Not Send', 'Please try again.');
    }
  };

  return (
    <AuthLayout
      variant="user"
      eyebrow="Welcome to MN Couture"
      title="Create Your Account"
      subtitle="Sign up once for premium collections, exclusive offers, and fast checkout."
    >
      <h2 className="auth-form-title">Create Account</h2>
      <p className="auth-form-subtitle">Set up your account in just a few seconds.</p>

      <form onSubmit={handleSubmit}>
        <div className="auth-avatar-picker">
          {uploading ? (
            <Loader3D size={30} />
          ) : (
            <img src={profilePic || '/default-avatar.svg'} alt="Profile preview" className="auth-avatar-preview" />
          )}
          <div className="auth-avatar-actions">
            <span className="auth-avatar-note">Profile Picture (Optional)</span>
            <div className="auth-avatar-actions-row">
              <label className="auth-avatar-action-btn">
                <FaUpload /> Device
                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
              </label>
              <button type="button" className="auth-avatar-action-btn" onClick={() => setPicMode((m) => (m === 'url' ? null : 'url'))}>
                <FaLink /> URL
              </button>
            </div>
            {picMode === 'url' && (
              <input
                type="text"
                className="auth-avatar-url-input"
                placeholder="Paste image URL"
                value={profilePic}
                onChange={(e) => setProfilePic(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email" type="email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password" type="password" required minLength={6}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" className="btn btn-primary modal-submit-btn" disabled={submitting}>
          {submitting ? 'Please wait...' : 'Create Account'}
        </button>
      </form>

      <p className="auth-form-footer">
        Already have an account?{' '}
        <button type="button" onClick={() => navigate('/login')}>Log In</button>
      </p>

      <OTPModal
        open={otpOpen}
        email={form.email}
        title="Verify Your Account"
        loading={otpLoading}
        error={otpError}
        onClose={() => setOtpOpen(false)}
        onVerify={handleVerify}
        onResend={handleResend}
      />
    </AuthLayout>
  );
};

export default Signup;
