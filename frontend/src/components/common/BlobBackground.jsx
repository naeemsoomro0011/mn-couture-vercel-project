import './common.css';

/**
 * Soft, slowly-morphing blob glows used as atmospheric background presence
 * behind sections — kept subtle and blurred so it never fights the content.
 */
const BlobBackground = ({ variant = 'default' }) => (
  <div className={`blob-bg blob-bg-${variant}`} aria-hidden="true">
    <span className="blob-glow blob-glow-a blob-morph" />
    <span className="blob-glow blob-glow-b blob-morph" />
  </div>
);

export default BlobBackground;
