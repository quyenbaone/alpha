import { useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { supabase } from './lib/supabase';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminEquipment } from './pages/AdminEquipment';
import { AdminRentals } from './pages/AdminRentals';
import { AdminReports } from './pages/AdminReports';
import { AdminSettings } from './pages/AdminSettings';
import { AdminUsers } from './pages/AdminUsers';
import { AuthCallback } from './pages/AuthCallback';
import { Cart } from './pages/Cart';
import { Equipment } from './pages/Equipment';
import { EquipmentDetail } from './pages/EquipmentDetail';
import { Home } from './pages/Home';
import { Messages } from './pages/Messages';
import { Profile } from './pages/Profile';
import { ResetPassword } from './pages/ResetPassword';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { useAuthStore } from './store/authStore';

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700">Đang tải...</h2>
      </div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

// Admin route component
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAdmin, loading } = useAuthStore();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700">Đang tải...</h2>
      </div>
    </div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  const { setSession } = useAuthStore();

  useEffect(() => {
    // Check for existing session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return (
    <Router>
      <Toaster position="top-right" />
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="equipment" element={<Equipment />} />
              <Route path="equipment/:id" element={<EquipmentDetail />} />
              <Route path="cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/reports" element={
              <AdminRoute>
                <AdminReports />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            } />
            <Route path="/admin/equipment" element={
              <AdminRoute>
                <AdminEquipment />
              </AdminRoute>
            } />
            <Route path="/admin/rentals" element={
              <AdminRoute>
                <AdminRentals />
              </AdminRoute>
            } />
            <Route path="/admin/settings" element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            } />

            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}