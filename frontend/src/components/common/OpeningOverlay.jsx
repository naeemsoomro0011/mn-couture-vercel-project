import Portal from './Portal';
import Loader3D from './Loader3D';
import './OpeningOverlay.css';

const OpeningOverlay = ({ label }) => {
  if (!label) return null;
  return (
    <Portal>
      <div className="opening-overlay anim-scale">
        <div className="opening-overlay-card card-3d">
          <Loader3D size={38} />
          <p>Opening {label}...</p>
        </div>
      </div>
    </Portal>
  );
};

export default OpeningOverlay;
