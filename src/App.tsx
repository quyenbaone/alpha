import { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
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
import { useSettingsStore } from './store/settingsStore';

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
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
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
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
  const { setSession, loading } = useAuthStore();
  const { fetchSettings } = useSettingsStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      try {
        // Check for existing session on initial load
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session retrieval error:', error);
          toast.error('Lỗi kết nối với dịch vụ xác thực');
        } else if (data.session) {
          await setSession(data.session);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setInitializing(false);
      }
    }

    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session) {
          await setSession(session);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
      }
    });

    // Load application settings
    fetchSettings().catch(err => {
      console.error('Error fetching settings:', err);
    });

    return () => subscription.unsubscribe();
  }, [setSession, fetchSettings]);

  // Show loading screen while initializing auth
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Đang khởi tạo ứng dụng...</h2>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
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