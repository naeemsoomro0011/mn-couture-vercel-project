import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import UserChatBubble from './components/Chat/UserChatBubble';
import AdminLayout from './components/AdminLayout/AdminLayout';
import AdminProtectedRoute from './components/AdminLayout/AdminProtectedRoute';
import Loader3D from './components/common/Loader3D';

// Route-level code splitting — visitors download only the page they're on
// (shoppers never download the entire admin panel's JS, and vice versa).
const Home = lazy(() => import('./pages/Home/Home'));
const Login = lazy(() => import('./pages/UserAuth/Login'));
const Signup = lazy(() => import('./pages/UserAuth/Signup'));
const AdminLogin = lazy(() => import('./pages/AdminAuth/AdminLogin'));
const AdminItems = lazy(() => import('./pages/AdminDashboard/AdminItems'));
const AdminGallery = lazy(() => import('./pages/AdminDashboard/AdminGallery'));
const AdminInbox = lazy(() => import('./pages/AdminDashboard/AdminInbox'));
const AdminBasicInfo = lazy(() => import('./pages/AdminDashboard/AdminBasicInfo'));
const AdminProfile = lazy(() => import('./pages/AdminDashboard/AdminProfile'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

const PageLoader = () => (
  <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Loader3D />
  </div>
);

// Shopper-facing pages get the fixed Navbar + Footer + chat bubble. Auth
// pages (both user and admin) render full-screen without them, matching
// the split-screen premium login layout from the brief.
const SiteLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ flex: 1 }}>{children}</main>
    <Footer />
    <UserChatBubble />
  </>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<SiteLayout><Home /></SiteLayout>} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route path="/admin" element={<AdminLogin />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminProtectedRoute>
                      <AdminLayout />
                    </AdminProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="items" replace />} />
                  <Route path="items" element={<AdminItems />} />
                  <Route path="gallery" element={<AdminGallery />} />
                  <Route path="inbox" element={<AdminInbox />} />
                  <Route path="info" element={<AdminBasicInfo />} />
                  <Route path="profile" element={<AdminProfile />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
