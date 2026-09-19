import './common.css';

/**
 * A rotating gem/diamond loader with real 3D perspective (rotateY + rotateX)
 * and a gradient glow — replaces the earlier flat spinning ring with
 * something that reads as genuinely premium and on-brand for a couture shop.
 */
const Loader3D = ({ size = 38, label }) => (
  <div className="loader3d-wrap" role="status" aria-live="polite">
    <div className="loader3d-scene" style={{ width: size, height: size }}>
      <svg className="loader3d-gem" viewBox="0 0 48 48" style={{ width: size, height: size }}>
        <defs>
          <linearGradient id="mncGemGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--plum-light)" />
            <stop offset="1" stopColor="var(--gold-light)" />
          </linearGradient>
        </defs>
        <polygon points="24,2 44,18 36,46 12,46 4,18" fill="url(#mncGemGrad)" opacity="0.18" />
        <polygon points="24,2 44,18 36,46 12,46 4,18" fill="none" stroke="url(#mncGemGrad)" strokeWidth="2.5" strokeLinejoin="round" />
        <line x1="24" y1="2" x2="24" y2="46" stroke="url(#mncGemGrad)" strokeWidth="1" opacity="0.55" />
        <line x1="4" y1="18" x2="44" y2="18" stroke="url(#mncGemGrad)" strokeWidth="1" opacity="0.55" />
      </svg>
    </div>
    {label && <span className="loader3d-label">{label}</span>}
  </div>
);

export default Loader3D;
