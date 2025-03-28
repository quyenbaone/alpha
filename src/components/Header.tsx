import { Home, LogOut, Menu, MessageSquare, Search, Shield, User, X } from 'lucide-react';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { useEquipmentStore } from '../store/equipmentStore';
import { AuthModal } from './AuthModal';
import { NotificationsDropdown } from './NotificationsDropdown';

export function Header() {
  const { user, signOut, isAdmin } = useAuthStore();
  const { setFilters } = useEquipmentStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const handleAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await setFilters({ search: searchQuery.trim() || null });
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container">
        {/* Top Header */}
        <div className="py-2 text-sm border-b border-primary/20">
          <div className="flex justify-between items-center">
            <div className="hidden md:flex gap-4">
              <Link to="/become-lender" className="hover:text-primary-foreground/80">
                Trở thành người cho thuê
              </Link>
              <a href="#" className="hover:text-primary-foreground/80">Tải ứng dụng</a>
              <a href="#" className="hover:text-primary-foreground/80">Theo dõi chúng tôi</a>
            </div>
            <div className="flex gap-4 items-center">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={cn(
                        "hover:text-primary-foreground/80 flex items-center gap-1",
                        isActive('/admin') && "text-primary-foreground/80"
                      )}
                    >
                      <Shield className="h-4 w-4" />
                      <span className="hidden md:inline">Quản trị</span>
                    </Link>
                  )}
                  <NotificationsDropdown />
                  <Link
                    to="/messages"
                    className={cn(
                      "hover:text-primary-foreground/80",
                      isActive('/messages') && "text-primary-foreground/80"
                    )}
                  >
                    <span className="hidden md:inline">Tin nhắn</span>
                    <MessageSquare className="h-4 w-4 md:hidden" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="hover:text-primary-foreground/80 flex items-center gap-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden md:inline">Đăng xuất</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleAuth('signin')}
                    className="hover:text-primary-foreground/80"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => handleAuth('signup')}
                    className="hover:text-primary-foreground/80"
                  >
                    Đăng ký
                  </button>
                </>
              )}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden"
              >
                {showMobileMenu ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="py-4">
          <div className="flex items-center gap-8">
            <div
              onClick={() => window.location.href = '/'}
              className="text-2xl font-bold flex items-center gap-2 cursor-pointer"
            >
              <Home className="h-8 w-8" />
              Alpha
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-4xl hidden md:flex">
              <div className="flex w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm thiết bị..."
                  className="w-full px-4 py-2 rounded-l-lg text-foreground focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-primary-foreground/10 px-6 rounded-r-lg hover:bg-primary-foreground/20"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>

            {/* Header Icons */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/messages"
                className={cn(
                  "hover:text-primary-foreground/80",
                  isActive('/messages') && "text-primary-foreground/80"
                )}
              >
                <MessageSquare className="h-6 w-6" />
              </Link>
              <Link
                to="/profile"
                className={cn(
                  "hover:text-primary-foreground/80",
                  isActive('/profile') && "text-primary-foreground/80"
                )}
              >
                <User className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Mobile Search (Visible on small screens) */}
          <form onSubmit={handleSearch} className="mt-4 md:hidden">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm thiết bị..."
                className="w-full px-4 py-2 rounded-l-lg text-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="bg-primary-foreground/10 px-6 rounded-r-lg hover:bg-primary-foreground/20"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-primary/20 py-4">
            <nav className="flex flex-col gap-4">
              <Link
                to="/become-lender"
                className="hover:text-primary-foreground/80 flex items-center gap-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Trở thành người cho thuê
              </Link>
              <a
                href="#"
                className="hover:text-primary-foreground/80 flex items-center gap-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Tải ứng dụng
              </a>
              <a
                href="#"
                className="hover:text-primary-foreground/80 flex items-center gap-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Theo dõi chúng tôi
              </a>
            </nav>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </header>
  );
}