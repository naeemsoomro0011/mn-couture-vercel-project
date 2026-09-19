import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Loader3D from '../common/Loader3D';

const AdminProtectedRoute = ({ children }) => {
  const { admin, loadingAdmin } = useAdminAuth();

  if (loadingAdmin) {
    return (
      <div data-theme="dark" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c1416' }}>
        <Loader3D label="Loading..." />
      </div>
    );
  }

  if (!admin) return <Navigate to="/admin" replace />;
  return children;
};

export default AdminProtectedRoute;
