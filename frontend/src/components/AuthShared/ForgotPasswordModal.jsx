import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import Loader3D from '../common/Loader3D';
import Portal from '../common/Portal';
import './AuthShared.css';

/**
 * onRequestOTP(email) -> Promise   (step 1: ask backend to send OTP)
 * onResetPassword({email, otp, newPassword}) -> Promise   (step 2)
 */
const ForgotPasswordModal = ({ open, onClose, onRequestOTP, onResetPassword }) => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const reset = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    setNewPassword('');
    setError('');
    setLoading(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onRequestOTP(email);
      setStep('reset');
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onResetPassword({ email, otp, newPassword });
      close();
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
    <div className="modal-overlay anim-scale" onClick={close}>
      <div className="modal-card card-3d anim-up" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={close} aria-label="Close">
          <FaTimes />
        </button>
        <h3 className="modal-title">Forgot Password?</h3>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
            <p className="modal-subtitle">Enter your email and we'll send you a verification code.</p>
            <div className="field">
              <label htmlFor="fp-email">Email</label>
              <input
                id="fp-email" type="email" required autoFocus
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            {error && <p className="field-error">{error}</p>}
            {loading ? (
              <Loader3D size={32} />
            ) : (
              <button type="submit" className="btn btn-primary modal-submit-btn">Send OTP</button>
            )}
          </form>
        ) : (
          <form onSubmit={handleResetSubmit}>
            <p className="modal-subtitle">Enter the code sent to <strong>{email}</strong> and your new password.</p>
            <div className="field">
              <label htmlFor="fp-otp">6-Digit OTP</label>
              <input
                id="fp-otp" type="text" inputMode="numeric" maxLength={6} required
                value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="field">
              <label htmlFor="fp-pass">New Password</label>
              <input
                id="fp-pass" type="password" required minLength={6}
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            {error && <p className="field-error">{error}</p>}
            {loading ? (
              <Loader3D size={32} />
            ) : (
              <button type="submit" className="btn btn-primary modal-submit-btn">Change Password</button>
            )}
          </form>
        )}
      </div>
    </div>
    </Portal>
  );
};

export default ForgotPasswordModal;
