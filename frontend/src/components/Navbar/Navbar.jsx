import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSun, FaMoon, FaShoppingBag, FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { fetchMyOrders } from '../../api/orders';
import Logo from '../common/Logo';
import UserProfileModal from './UserProfileModal';
import UserOrdersModal from './UserOrdersModal';
import './Navbar.css';

const initials = (name = '') =>
  name.trim().split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#top-picks', label: 'Top Picks' },
  { href: '#categories', label: 'Categories' },
  { href: '#shop', label: 'Shop' },
  { href: '#ai-chat', label: 'AI Assistant' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#contact', label: 'Contact' },
];

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [orders, setOrders] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openOrders = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setOrdersModalOpen(true);
    setOrdersLoading(true);
    fetchMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  };

  const handleOrderUpdated = (updatedOrder) => {
    setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
  };

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
  };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
    <header className="navbar">
      <div className="navbar-inner container">
        <Logo size={38} className="navbar-logo" />

        <nav className="navbar-center">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar-right">
          <button className="icon-btn navbar-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>

          <button className="icon-btn" onClick={openOrders} aria-label="My orders">
            <FaShoppingBag />
          </button>

          {user ? (
            <div className="navbar-dropdown-wrap" ref={profileRef}>
              <button
                className="navbar-avatar-btn"
                onClick={() => setProfileOpen((o) => !o)}
                aria-label="Profile menu"
                aria-expanded={profileOpen}
              >
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.name} className="navbar-avatar-img" />
                ) : (
                  <span className="navbar-avatar-fallback">{initials(user.name) || <FaUser />}</span>
                )}
              </button>
              {profileOpen && (
                <div className="navbar-dropdown anim-down">
                  <p className="navbar-dropdown-title">{user.name}</p>
                  <button className="navbar-dropdown-item" onClick={() => { setProfileOpen(false); setProfileModalOpen(true); }}>
                    <FaUser /> Profile
                  </button>
                  <button className="navbar-dropdown-item navbar-dropdown-item-danger" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-primary navbar-auth-btn" onClick={() => navigate('/login')}>
              Not Logged In
            </button>
          )}

          <button
            className="icon-btn navbar-hamburger"
            onClick={() => setMenuOpen((m) => !m)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-menu anim-down">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)}>
              {link.label}
            </a>
          ))}
          {!user && (
            <button className="btn btn-primary" onClick={() => { setMenuOpen(false); navigate('/login'); }}>
              Not Logged In
            </button>
          )}
        </div>
      )}
    </header>

    <UserProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    <UserOrdersModal
      open={ordersModalOpen}
      orders={orders}
      loading={ordersLoading}
      onClose={() => setOrdersModalOpen(false)}
      onUpdated={handleOrderUpdated}
    />
    </>
  );
};

export default Navbar;
