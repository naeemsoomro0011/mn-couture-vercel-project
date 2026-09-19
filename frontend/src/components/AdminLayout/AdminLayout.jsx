import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaBoxOpen, FaImages, FaInbox, FaInfoCircle, FaUserCircle, FaSignOutAlt, FaBars, FaChevronLeft, FaSun, FaMoon } from 'react-icons/fa';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { fetchUnseenOrderCount } from '../../api/admin';
import socket from '../../socket';
import Logo from '../common/Logo';
import { alertConfirm } from '../../utils/alerts';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard/items', icon: FaBoxOpen, label: 'Items' },
  { to: '/admin/dashboard/gallery', icon: FaImages, label: 'Gallery' },
  { to: '/admin/dashboard/inbox', icon: FaInbox, label: 'Inbox', badge: true },
  { to: '/admin/dashboard/info', icon: FaInfoCircle, label: 'Basic Info' },
  { to: '/admin/dashboard/profile', icon: FaUserCircle, label: 'Profile' },
];

const AdminLayout = () => {
  const { logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);

  const loadUnseenCount = () => {
    fetchUnseenOrderCount().then(setUnseenCount).catch(() => {});
  };

  useEffect(() => {
    loadUnseenCount();
    socket.connect();
    socket.emit('join', { role: 'admin' });
    socket.on('newOrder', loadUnseenCount);
    socket.on('ordersChanged', loadUnseenCount);
    return () => {
      socket.off('newOrder', loadUnseenCount);
      socket.off('ordersChanged', loadUnseenCount);
    };
  }, []);

  // Refresh the badge whenever the admin visits/leaves the Inbox page.
  useEffect(() => {
    loadUnseenCount();
  }, [location.pathname]);

  const handleLogout = async () => {
    const confirmed = await alertConfirm('Log out?', 'You will be signed out of the admin panel.', 'Logout');
    if (!confirmed) return;
    await logout();
    navigate('/admin');
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${collapsed ? 'admin-sidebar-collapsed' : ''}`}>
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-brand">
            <Logo size={36} showText={!collapsed} />
          </div>
          <button className="admin-collapse-btn" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar">
            {collapsed ? <FaBars /> : <FaChevronLeft />}
          </button>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `admin-nav-item ${isActive ? 'admin-nav-active' : ''}`}>
              <span className="admin-nav-icon-wrap">
                <Icon />
                {badge && unseenCount > 0 && <span className="admin-nav-badge">{unseenCount > 9 ? '9+' : unseenCount}</span>}
              </span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <button className="admin-nav-item admin-theme-btn" onClick={toggleTheme}>
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <button className="admin-nav-item admin-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          {!collapsed && <span>Logout</span>}
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>

      <nav className="admin-tabbar">
        {NAV_ITEMS.map(({ to, icon: Icon, label, badge }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `admin-tab-item ${isActive ? 'admin-tab-active' : ''}`}>
            <span className="admin-nav-icon-wrap">
              <Icon />
              {badge && unseenCount > 0 && <span className="admin-nav-badge">{unseenCount > 9 ? '9+' : unseenCount}</span>}
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
        <button className="admin-tab-item" onClick={toggleTheme}>
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
          <span>Theme</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminLayout;
