import BlobBackground from '../common/BlobBackground';
import Logo from '../common/Logo';
import AuthIllustration from './AuthIllustration';
import './AuthShared.css';

/**
 * variant='user'  -> follows the site's current theme
 * variant='admin' -> always the dark, matte, colourful premium theme
 *                    (per the brief), regardless of site theme
 */
const AuthLayout = ({ variant = 'user', eyebrow, title, subtitle, children }) => (
  <div className={`auth-layout auth-layout-${variant}`} data-theme={variant === 'admin' ? 'dark' : undefined}>
    <div className="auth-panel auth-panel-brand">
      <BlobBackground variant={variant} />
      <div className="auth-brand-content anim-left">
        <Logo size={52} />
        {eyebrow && <p className="auth-eyebrow">{eyebrow}</p>}
        <h1 className="auth-brand-title">{title}</h1>
        <p className="auth-brand-subtitle">{subtitle}</p>
        <AuthIllustration variant={variant} />
      </div>
    </div>

    <div className="auth-panel auth-panel-form">
      <div className="auth-form-card card-3d anim-right">{children}</div>
    </div>
  </div>
);

export default AuthLayout;
