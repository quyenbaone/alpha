import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CategoryNav } from './components/CategoryNav';
import { EquipmentCard } from './components/EquipmentCard';
import { FilterPanel } from './components/FilterPanel';
import { EquipmentDetail } from './pages/EquipmentDetail';
import { Profile } from './pages/Profile';
import { Messages } from './pages/Messages';
import { AdminDashboard } from './pages/AdminDashboard';
import { useEquipmentStore } from './store/equipmentStore';
import { Filter, AlertCircle } from 'lucide-react';

// Import new pages
import { About } from './pages/About';
import { Careers } from './pages/Careers';
import { Press } from './pages/Press';
import { Blog } from './pages/Blog';
import { Help } from './pages/Help';
import { Safety } from './pages/Safety';
import { EquipmentCare } from './pages/EquipmentCare';
import { Insurance } from './pages/Insurance';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Cookies } from './pages/Cookies';
import { RentalAgreement } from './pages/RentalAgreement';
import { BecomeLender } from './pages/BecomeLender';

function App() {
  const { setSession, user, isAdmin } = useAuthStore();
  const { items, loading, error, fetchEquipment, setFilters, clearError } = useEquipmentStore();
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    fetchEquipment();

    return () => subscription.unsubscribe();
  }, [setSession, fetchEquipment]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <div className="container">
                  <CategoryNav />
                  
                  <div className="py-8">
                    <div className="flex items-center gap-4 mb-6">
                      <button 
                        onClick={() => setShowFilterPanel(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg shadow hover:shadow-md transition-shadow"
                      >
                        <Filter className="h-4 w-4" />
                        Bộ lọc
                      </button>
                    </div>

                    {error && (
                      <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <p className="text-destructive">{error}</p>
                        <button 
                          onClick={clearError}
                          className="ml-auto text-destructive hover:text-destructive/80"
                        >
                          Đóng
                        </button>
                      </div>
                    )}

                    {loading ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                        <p className="mt-2 text-muted-foreground">Đang tải thiết bị...</p>
                      </div>
                    ) : items.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {items.map((item) => (
                          <EquipmentCard key={item.id} item={item} />
                        ))}
                      </div>
                    ) : !error && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">
                          Không tìm thấy thiết bị. Hãy thử điều chỉnh bộ lọc.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              }
            />
            <Route path="/equipment/:id" element={<EquipmentDetail />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
            <Route path="/messages" element={user ? <Messages /> : <Navigate to="/" />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
            
            {/* Static pages */}
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/press" element={<Press />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/help" element={<Help />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/equipment-care" element={<EquipmentCare />} />
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/rental-agreement" element={<RentalAgreement />} />
            <Route path="/become-lender" element={<BecomeLender />} />
          </Routes>
        </main>

        <Footer />

        <FilterPanel 
          isOpen={showFilterPanel} 
          onClose={() => setShowFilterPanel(false)} 
        />
      </div>
    </Router>
  );
}

export default App;