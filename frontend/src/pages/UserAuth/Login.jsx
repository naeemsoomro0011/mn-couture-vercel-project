import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthShared/AuthLayout';
import ForgotPasswordModal from '../../components/AuthShared/ForgotPasswordModal';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { alertSuccess } from '../../utils/alerts';
import './UserAuth.css';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setUser(data.user);
      alertSuccess('Welcome Back!', `Hi, ${data.user.name}`);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Wrong email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      variant="user"
      eyebrow="Welcome Back"
      title="Log In to Your Account"
      subtitle="View your past orders, chat with us, and be the first to see new arrivals."
    >
      <h2 className="auth-form-title">Login</h2>
      <p className="auth-form-subtitle">Enter your email and password.</p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email" type="email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password" type="password" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="auth-form-links">
          <span />
          <button type="button" onClick={() => setForgotOpen(true)}>Forgot Password?</button>
        </div>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" className="btn btn-primary modal-submit-btn" disabled={submitting}>
          {submitting ? 'Please wait...' : 'Login'}
        </button>
      </form>

      <p className="auth-form-footer">
        Don't have an account?{' '}
        <button type="button" onClick={() => navigate('/signup')}>Create Account</button>
      </p>

      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onRequestOTP={(email) => api.post('/auth/forgot-password', { email })}
        onResetPassword={(payload) => api.post('/auth/reset-password', payload)}
      />
    </AuthLayout>
  );
};

export default Login;
