import { useRef, useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import Loader3D from '../common/Loader3D';
import Portal from '../common/Portal';
import './AuthShared.css';

const OTPModal = ({ open, email, title = 'Verify OTP', loading, error, onClose, onVerify, onResend }) => {
  const [digits, setDigits] = useState(Array(6).fill(''));
  const inputsRef = useRef([]);

  useEffect(() => {
    if (open) {
      setDigits(Array(6).fill(''));
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setDigits(Array(6).fill('').map((_, i) => pasted[i] || ''));
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length === 6) onVerify(otp);
  };

  return (
    <Portal>
    <div className="modal-overlay anim-scale" onClick={onClose}>
      <div className="modal-card card-3d anim-up" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-subtitle">Enter the 6-digit code sent to <strong>{email}</strong>.</p>

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="otp-input"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          {error && <p className="field-error otp-error">{error}</p>}

          {loading ? (
            <Loader3D size={34} label="Verifying..." />
          ) : (
            <button type="submit" className="btn btn-primary modal-submit-btn" disabled={digits.join('').length !== 6}>
              Confirm
            </button>
          )}
        </form>

        <button className="modal-resend-btn" onClick={onResend} type="button" disabled={loading}>
          Didn't get the code? Resend
        </button>
      </div>
    </div>
    </Portal>
  );
};

export default OTPModal;
