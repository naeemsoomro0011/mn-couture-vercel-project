import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthShared/AuthLayout';
import ForgotPasswordModal from '../../components/AuthShared/ForgotPasswordModal';
import api from '../../api/axios';
import { alertSuccess } from '../../utils/alerts';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './AdminAuth.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { setAdmin } = useAdminAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/admin/auth/login', form);
      setAdmin(data.admin);
      alertSuccess('Welcome Back!', `Hi, ${data.admin.name}`);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Wrong email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      variant="admin"
      eyebrow="Admin Portal"
      title="MN Couture Control Panel"
      subtitle="Manage items, orders, gallery, and all shop settings from here."
    >
      <h2 className="auth-form-title">Admin Login</h2>
      <p className="auth-form-subtitle">For shop owner use only — enter your admin credentials.</p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email" type="email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password" type="password" required
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

      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onRequestOTP={(email) => api.post('/admin/auth/forgot-password', { email })}
        onResetPassword={(payload) => api.post('/admin/auth/reset-password', payload)}
      />
    </AuthLayout>
  );
};

export default AdminLogin;
