import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import Layout from './components/Layout';
import { supabase } from './lib/supabase';
import { AdminDashboard } from './pages/AdminDashboard';
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

export default function App() {
  const { setSession } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

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
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="equipment" element={<Equipment />} />
              <Route path="equipment/:id" element={<EquipmentDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}