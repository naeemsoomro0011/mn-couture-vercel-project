import { Link } from 'react-router-dom';
import './common.css';

const Logo = ({ size = 42, showText = true, to = '/', className = '' }) => (
  <Link to={to} className={`mnc-logo ${className}`}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mncLogoGrad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6D28D9" />
          <stop offset="1" stopColor="#DB2777" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" stroke="url(#mncLogoGrad)" strokeWidth="1.6" />
      <circle cx="32" cy="32" r="23.5" stroke="url(#mncLogoGrad)" strokeWidth="0.6" opacity="0.55" />
      <text
        x="32" y="41" textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif" fontSize="22" fontWeight="600"
        fill="url(#mncLogoGrad)"
      >
        MN
      </text>
    </svg>
    {showText && (
      <span className="mnc-logo-text">
        MN <em>Couture</em>
      </span>
    )}
  </Link>
);

export default Logo;
