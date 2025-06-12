import { Camera, ChevronDown, Home, LogIn, LogOut, Mail, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';

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
    { to: '/contact', label: 'Liên hệ', icon: <Mail className="h-5 w-5" /> },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0F4D4D] shadow-xl backdrop-blur-md'
          : 'bg-[#0F4D4D]'
      } font-sans`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 select-none"
            onClick={() => window.scrollTo(0, 0)}
          >
            {settings.site_logo ? (
              <img
                src={settings.site_logo}
                alt={settings.site_name || 'Logo'}
                className="h-10 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/logo.png';
                }}
              />
            ) : (
              <Camera className="h-10 w-10 text-white" />
            )}
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {settings.site_name || 'Alpha'}
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6 font-semibold text-white">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => window.scrollTo(0, 0)}
                className={`flex items-center gap-2 px-5 py-2 rounded-md transition-colors duration-300 ${
                  location.pathname === item.to
                    ? 'bg-white/25 text-white shadow-inner'
                    : 'hover:bg-white/20 hover:text-white'
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
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/30 bg-transparent text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white transition duration-300"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-6">
            <Link
              to="/cart"
              className="relative text-white hover:text-white/80 transition-colors"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="h-7 w-7" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-2 w-5 h-5 bg-white text-[#0F4D4D] text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                  {items.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1 text-white hover:text-white/80 transition-colors"
                  aria-label="Menu người dùng"
                >
                  <User className="h-7 w-7" />
                  <ChevronDown className="h-5 w-5" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 dropdown-menu">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{getUserRole()}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="dropdown-item"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Tài khoản của tôi
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="dropdown-item"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Quản trị viên
                        </Link>
                      )}
                      {userRole === 'owner' && (
                        <Link
                          to="/owner"
                          className="dropdown-item"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Quản lý cho thuê
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/signin"
                className="px-5 py-2 rounded-lg font-semibold bg-[#70B8B0] text-[#0F4D4D] hover:bg-white hover:text-[#0F4D4D] transition-all duration-300 flex items-center gap-2"
              >
                <LogIn className="h-5 w-5" /> Đăng nhập
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#0F4D4D] shadow-lg rounded-b-lg mt-2 py-4 animate-fade-in-down">
            <nav className="px-4 flex flex-col gap-2 text-white font-semibold">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-white/20 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              <Link
                to="/cart"
                className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-white/20 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5" /> Giỏ hàng
              </Link>
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-white/20 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" /> Tài khoản
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-white/20 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" /> Quản trị viên
                    </Link>
                  )}
                  {userRole === 'owner' && (
                    <Link
                      to="/owner"
                      className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-white/20 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" /> Quản lý cho thuê
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-600/30 w-full text-left"
                  >
                    <LogOut className="h-5 w-5" /> Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  to="/signin"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-white/20 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
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
