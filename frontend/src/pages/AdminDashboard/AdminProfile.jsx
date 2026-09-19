import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEdit, FaKey, FaSignOutAlt, FaPhone, FaWhatsapp, FaEnvelope, FaShieldAlt,
  FaCrown, FaRegCalendarAlt, FaUserShield,
} from 'react-icons/fa';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminProfileEditModal from '../../components/AdminShared/AdminProfileEditModal';
import AdminPasswordModal from '../../components/AdminShared/AdminPasswordModal';
import { alertConfirm, alertSuccess } from '../../utils/alerts';
import './AdminPages.css';

const joinedLabel = (date) => {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
};

const AdminProfile = () => {
  const { admin, setAdmin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const handleLogout = async () => {
    const confirmed = await alertConfirm('Log out?', 'You will be signed out of the admin panel.', 'Logout');
    if (!confirmed) return;
    await logout();
    navigate('/admin');
  };

  if (!admin) return null;

  const joined = joinedLabel(admin.createdAt);

  return (
    <div className="admin-page admin-page-wide">
      <div className="admin-page-header">
        <div>
          <h2>Profile</h2>
          <p className="admin-page-subtitle">Your admin account and security settings.</p>
        </div>
      </div>

      {/* ---- Hero: banner on top, all text safely below it ---- */}
      <div className="admin-profile-hero card-3d admin-reveal" style={{ '--d': '0.02s' }}>
        <div className="admin-profile-banner">
          <span className="admin-profile-banner-badge"><FaCrown /> Administrator</span>
        </div>

        <div className="admin-profile-body">
          <div className="admin-profile-identity">
            <div className="admin-profile-pic-wrap">
              {admin.profilePic ? (
                <img src={admin.profilePic} alt={admin.name} className="admin-profile-pic" />
              ) : (
                <div className="admin-profile-pic admin-profile-pic-fallback">{admin.name?.[0]?.toUpperCase()}</div>
              )}
            </div>

            <div className="admin-profile-name-block">
              <h3>{admin.name}</h3>
              <p className="admin-profile-email">{admin.email}</p>
              <div className="admin-profile-tags">
                <span className="admin-profile-tag"><FaUserShield /> Full Access</span>
                {joined && <span className="admin-profile-tag"><FaRegCalendarAlt /> Since {joined}</span>}
              </div>
            </div>
          </div>

          <button type="button" className="btn btn-primary admin-profile-edit-btn" onClick={() => setEditOpen(true)}>
            <FaEdit /> Edit Profile
          </button>
        </div>
      </div>

      <div className="admin-profile-grid">
        <div className="admin-profile-info-card card-3d admin-reveal" style={{ '--d': '0.1s' }}>
          <h4><FaPhone /> Contact Details</h4>
          <div className="admin-profile-lines">
            <p><span className="admin-profile-line-icon"><FaPhone /></span> <span>{admin.number || 'Not set'}</span></p>
            <p><span className="admin-profile-line-icon"><FaWhatsapp /></span> <span>{admin.whatsappNumber || 'Not set'}</span></p>
            <p><span className="admin-profile-line-icon"><FaEnvelope /></span> <span>{admin.email}</span></p>
          </div>
        </div>

        <div className="admin-profile-info-card card-3d admin-reveal" style={{ '--d': '0.16s' }}>
          <h4><FaShieldAlt /> Security</h4>
          <p className="admin-profile-security-note">Keep your account safe with a strong, unique password.</p>
          <button type="button" className="btn btn-outline admin-profile-security-btn" onClick={() => setPasswordOpen(true)}>
            <FaKey /> Update Password
          </button>
        </div>
      </div>

      <button type="button" className="btn btn-outline admin-profile-logout" onClick={handleLogout}>
        <FaSignOutAlt /> Logout
      </button>

      <AdminProfileEditModal open={editOpen} admin={admin} onClose={() => setEditOpen(false)} onUpdated={setAdmin} />
      <AdminPasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSuccess={() => alertSuccess('Password Updated', 'Your password has been changed successfully.')}
      />
    </div>
  );
};

export default AdminProfile;
