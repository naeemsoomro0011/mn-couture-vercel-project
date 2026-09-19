import { Link } from 'react-router-dom';
import BlobBackground from '../../components/common/BlobBackground';

const NotFound = () => (
  <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
    <BlobBackground variant="default" />
    <div style={{ position: 'relative', zIndex: 1 }} className="anim-scale">
      <h1 style={{ fontSize: '5rem', marginBottom: '0.5rem' }}>404</h1>
      <p style={{ marginBottom: '2rem' }}>This page couldn't be found in our shop.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  </section>
);

export default NotFound;
