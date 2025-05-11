import { Camera, ChevronDown, LogIn, LogOut, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuthStore();
  const { items } = useCartStore();
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

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    if (user?.role === 'owner') return 'Chủ nhà';
    return 'Người thuê';
  };

  const menuItems = [
    { to: '/equipment', label: 'Thiết bị', icon: <Camera className="h-5 w-5" /> },
    { to: '/bookings', label: 'Đặt lịch', icon: <CalendarIcon /> },
    { to: '/reviews', label: 'Đánh giá', icon: <StarIcon /> },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#1e293b] shadow-lg backdrop-blur-md' : 'bg-[#1e293b]'} font-sans`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 select-none">
            <Camera className={`h-8 w-8 text-blue-400`} />
            <span className={`text-2xl font-extrabold tracking-tight text-white`}>RentHub</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${location.pathname === item.to ? 'bg-blue-800 text-white' : 'text-blue-100 hover:text-blue-400 hover:bg-blue-800/60'}`}
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
                className={`w-full pl-10 pr-4 py-2 rounded-full border bg-blue-900 border-blue-800 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all duration-200`}
              />
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300`} />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            <Link to="/cart" className={`relative p-2 rounded-full transition-colors duration-200 text-blue-100 hover:bg-blue-800/60`}>
              <ShoppingCart className="h-6 w-6" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {items.length}
                </span>
              )}
            </Link>
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-blue-100 hover:bg-blue-800/60 transition-all duration-200"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline text-sm font-medium">{getUserRole()}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden z-10 border border-gray-200">
                    <div className="p-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">{getUserRole()}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Tài khoản của tôi
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Quản trị viên
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
              <Link to="/signin" className="px-5 py-2 rounded-full font-semibold bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                <LogIn className="h-5 w-5" /> Đăng nhập
              </Link>
            )}
            {/* Mobile menu button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`md:hidden p-2 rounded-full text-blue-100 hover:bg-blue-800/60`}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#1e293b] shadow-lg rounded-b-xl mt-2 py-4 animate-fade-in-down">
            <nav className="px-4 flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2 px-4 py-3 text-blue-100 hover:text-blue-400 hover:bg-blue-800/60 rounded-lg font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              <Link to="/cart" className="flex items-center gap-2 px-4 py-3 text-blue-100 hover:text-blue-400 hover:bg-blue-800/60 rounded-lg font-semibold">
                <ShoppingCart className="h-5 w-5" /> Giỏ hàng
              </Link>
              {user ? (
                <>
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-blue-100 hover:text-blue-400 hover:bg-blue-800/60 rounded-lg font-semibold">
                    <User className="h-5 w-5" /> Tài khoản ({getUserRole()})
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 text-red-300 hover:text-red-400 hover:bg-blue-800/60 rounded-lg font-semibold"
                  >
                    <LogOut className="h-5 w-5" /> Đăng xuất
                  </button>
                </>
              ) : (
                <Link to="/signin" className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-semibold shadow-lg">
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
  return <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
}
function StarIcon() {
  return <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2" /></svg>;
}