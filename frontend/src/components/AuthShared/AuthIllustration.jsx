/**
 * Simple flat-vector illustration in the couture palette — used on both
 * login pages per the brief's reference screenshots. variant='admin' shows
 * a shield (security), variant='user' shows a shopping bag.
 */
const AuthIllustration = ({ variant = 'user' }) => (
  <svg viewBox="0 0 320 260" className="auth-illustration" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="authIconGrad" x1="0" y1="0" x2="40" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#6D28D9" />
        <stop offset="1" stopColor="#DB2777" />
      </linearGradient>
    </defs>

    <ellipse cx="160" cy="230" rx="118" ry="13" fill="#DB2777" opacity="0.12" />

    {/* desk */}
    <rect x="66" y="176" width="154" height="9" rx="4" fill="#DB2777" opacity="0.85" />
    <rect x="76" y="185" width="7" height="38" fill="#DB2777" opacity="0.55" />
    <rect x="204" y="185" width="7" height="38" fill="#DB2777" opacity="0.55" />

    {/* laptop */}
    <rect x="116" y="148" width="70" height="30" rx="4" fill="#1B1A24" stroke="#DB2777" strokeWidth="2" />
    <rect x="121" y="152" width="60" height="22" rx="2" fill="#6D28D9" opacity="0.4" />
    <rect x="110" y="176" width="82" height="7" rx="3" fill="#24222F" />

    {/* body */}
    <path d="M147 176 C147 148 150 122 165 122 C180 122 183 148 183 176 Z" fill="#6D28D9" />
    {/* head */}
    <circle cx="165" cy="102" r="21" fill="#E8B98A" />
    {/* hair */}
    <path d="M145 97 C145 76 185 76 185 97 C185 84 176 80 165 80 C154 80 145 84 145 97Z" fill="#2A1E14" />
    {/* arm reaching to laptop */}
    <path d="M182 150 C194 146 199 140 197 132" stroke="#E8B98A" strokeWidth="8" strokeLinecap="round" fill="none" />

    {variant === 'admin' ? (
      <g transform="translate(226 44)">
        <path d="M20 0 L38 8 V26 C38 40 20 48 20 48 C20 48 2 40 2 26 V8 Z" fill="url(#authIconGrad)" />
        <path d="M12 24 L18 30 L29 17" stroke="#fff8ef" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    ) : (
      <g transform="translate(228 42)">
        <path d="M12 14 V8 a9 9 0 0 1 18 0 v6" stroke="url(#authIconGrad)" strokeWidth="4" fill="none" />
        <rect x="4" y="14" width="34" height="30" rx="7" fill="url(#authIconGrad)" />
      </g>
    )}

    <circle cx="66" cy="58" r="4" fill="#DB2777" />
    <circle cx="252" cy="150" r="3" fill="#6D28D9" />
    <circle cx="58" cy="160" r="3" fill="#DB2777" />
  </svg>
);

export default AuthIllustration;
