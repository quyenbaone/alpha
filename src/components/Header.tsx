import { Camera, ChevronDown, Home, LogIn, LogOut, Mail, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { ThemeToggle } from './ThemeToggle';
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, signOut, isAdmin, userRole } = useAuthStore();
  const { items } = useCartStore();
  const { settings, fetchSettings } = useSettingsStore();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    fetchSettings();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fetchSettings]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Đăng xuất thành công');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  const getUserRole = () => {
    if (isAdmin) return 'Admin';
    if (userRole === 'owner') return 'Chủ sở hữu';
    return 'Người thuê';
  };

  const menuItems = [
    { to: '/', label: 'Home', icon: <Home className="h-5 w-5" /> },
    { to: '/equipment', label: 'Thiết bị', icon: <Camera className="h-5 w-5" /> },
    { to: '/contact', label: 'Liên hệ', icon: <Mail className="h-5 w-5" /> },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#1e293b] shadow-lg backdrop-blur-md' : 'bg-[#1e293b]'} font-sans`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 select-none" onClick={() => window.scrollTo(0, 0)}>
            {settings.site_logo ? (
              <img
                src={settings.site_logo}
                alt={settings.site_name || "Logo"}
                className="h-8 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop
                  target.src = '/logo.png';
                }}
              />
            ) : (
              <Camera className="h-8 w-8 text-white" />
            )}
            <span className="text-2xl font-extrabold tracking-tight text-white">
              {settings.site_name || 'Alpha'}
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => window.scrollTo(0, 0)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${location.pathname === item.to
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm thiết bị..."
                className="w-full pl-10 pr-4 py-2 rounded-full border bg-white/10 border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-sm transition-all duration-200"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            <Link to="/cart" className="relative p-2 rounded-full transition-colors duration-200 text-white/90 hover:bg-white/10">
              <ShoppingCart className="h-6 w-6" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {items.length}
                </span>
              )}
            </Link>

            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 transition-all duration-200"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline text-sm font-medium">{getUserRole()}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10 border border-gray-200 dark:border-gray-700">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{getUserRole()}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Tài khoản của tôi
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Quản trị viên
                        </Link>
                      )}
                      {userRole === 'owner' && (
                        <Link
                          to="/owner"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Quản lý cho thuê
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Đăng xuất
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/signin" className="px-5 py-2 rounded-full font-semibold bg-white text-primary shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                <LogIn className="h-5 w-5" /> Đăng nhập
              </Link>
            )}
            {/* Mobile menu button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-full text-white/90 hover:bg-white/10">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-primary shadow-lg rounded-b-xl mt-2 py-4 animate-fade-in-down">
            <nav className="px-4 flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              <Link to="/cart" className="flex items-center gap-2 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-semibold">
                <ShoppingCart className="h-5 w-5" /> Giỏ hàng
              </Link>
              {user ? (
                <>
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-semibold">
                    <User className="h-5 w-5" /> Tài khoản
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-semibold">
                      <User className="h-5 w-5" /> Quản trị viên
                    </Link>
                  )}
                  {userRole === 'owner' && (
                    <Link to="/owner" className="flex items-center gap-2 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-semibold">
                      <User className="h-5 w-5" /> Quản lý cho thuê
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 text-red-200 hover:text-red-100 hover:bg-red-500/20 rounded-lg font-semibold w-full text-left"
                  >
                    <LogOut className="h-5 w-5" /> Đăng xuất
                  </button>
                </>
              ) : (
                <Link to="/signin" className="flex items-center gap-2 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-semibold">
                  <LogIn className="h-5 w-5" /> Đăng nhập
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function CalendarIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M3.5 9H20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

function StarIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.73 3.51L15.49 7.03C15.73 7.52 16.37 7.99 16.91 8.08L20.1 8.61C22.14 8.95 22.62 10.43 21.15 11.89L18.67 14.37C18.25 14.79 18.02 15.6 18.15 16.18L18.86 19.25C19.42 21.68 18.13 22.62 15.98 21.35L12.99 19.58C12.45 19.26 11.56 19.26 11.01 19.58L8.02 21.35C5.88 22.62 4.58 21.67 5.14 19.25L5.85 16.18C5.98 15.6 5.75 14.79 5.33 14.37L2.85 11.89C1.39 10.43 1.86 8.95 3.9 8.61L7.09 8.08C7.63 7.99 8.27 7.52 8.51 7.03L10.27 3.51C11.22 1.6 12.78 1.6 13.73 3.51Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}