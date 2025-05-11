import { BarChart2, Briefcase, Handshake, Heart, Home, List, LogIn, LogOut, MessageCircle, PlusCircle, Search, ShoppingCart, Star, User, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useEquipmentStore } from '../store/equipmentStore';

export function Header() {
  const { user, signOut } = useAuthStore();
  const { setFilters } = useEquipmentStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await setFilters({ search: searchQuery.trim() || null });
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Helper: xác định vai trò
  const role = user?.role || (user?.is_admin ? 'admin' : null);

  // Menu động
  let menuItems: { label: string; icon: React.ReactNode; to: string; highlight?: boolean }[] = [];
  let accountMenu: { label: string; icon: React.ReactNode; to?: string; onClick?: () => void }[] = [];

  if (!user) {
    menuItems = [
      { label: 'Trang chủ', icon: <Home className="h-5 w-5" />, to: '/' },
      { label: 'Danh mục', icon: <List className="h-5 w-5" />, to: '/equipment' },
    ];
  } else if (role === 'renter') {
    menuItems = [
      { label: 'Trang chủ', icon: <Home className="h-5 w-5" />, to: '/' },
      { label: 'Tìm thiết bị', icon: <Search className="h-5 w-5" />, to: '/equipment', highlight: true },
      { label: 'Đơn thuê của tôi', icon: <Briefcase className="h-5 w-5" />, to: '/orders' },
      { label: 'Trò chuyện', icon: <MessageCircle className="h-5 w-5" />, to: '/messages' },
    ];
    accountMenu = [
      { label: 'Hồ sơ cá nhân', icon: <User className="h-5 w-5" />, to: '/profile' },
      { label: 'Sản phẩm yêu thích', icon: <Heart className="h-5 w-5" />, to: '/favorites' },
      { label: 'Đăng xuất', icon: <LogOut className="h-5 w-5" />, onClick: handleSignOut },
    ];
  } else if (role === 'owner') {
    menuItems = [
      { label: 'Trang chủ', icon: <Home className="h-5 w-5" />, to: '/' },
      { label: 'Thiết bị của tôi', icon: <List className="h-5 w-5" />, to: '/my-equipment' },
      { label: 'Đơn thuê', icon: <Briefcase className="h-5 w-5" />, to: '/orders' },
      { label: 'Doanh thu', icon: <BarChart2 className="h-5 w-5" />, to: '/revenue' },
    ];
    accountMenu = [
      { label: 'Cập nhật hồ sơ', icon: <User className="h-5 w-5" />, to: '/profile' },
      { label: 'Tạo thiết bị mới', icon: <PlusCircle className="h-5 w-5" />, to: '/my-equipment/new' },
      { label: 'Đăng xuất', icon: <LogOut className="h-5 w-5" />, onClick: handleSignOut },
    ];
  } else if (role === 'admin') {
    menuItems = [
      { label: 'Quản trị hệ thống', icon: <Star className="h-5 w-5" />, to: '/admin' },
    ];
  }

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-primary-foreground rounded-lg p-2 group-hover:scale-105 transition-transform duration-300 shadow-lg">
              <Handshake className="h-8 w-8 text-primary" />
            </div>
            <span className="brand-text">Alpha</span>
          </Link>

          {/* Menu chính */}
          <nav className="flex-1 flex gap-2 md:gap-6 items-center">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium hover:bg-primary-foreground/10 transition-colors ${item.highlight ? 'bg-orange-500 text-white hover:bg-orange-600' : ''}`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="flex w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm thiết bị..."
                className="input w-full rounded-r-none focus:ring-0 glass-effect"
              />
              <button
                type="submit"
                className="btn bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-l-none hover:shadow-lg hover:-translate-y-0.5"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          {/* Tài khoản & Giỏ hàng */}
          <div className="flex items-center gap-2 md:gap-4 relative">
            {/* Shopping Cart */}
            {role !== 'admin' && (
              <Link
                to="/cart"
                className="relative p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors hover-scale"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Đăng nhập/Đăng ký hoặc Dropdown tài khoản */}
            {!user ? (
              <>
                <button
                  onClick={() => navigate('/signin')}
                  className="btn glass-effect hover:bg-primary-foreground/20 nav-link"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  <span className="heading-highlight">Đăng nhập</span>
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="btn bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  <span className="heading-highlight">Đăng ký</span>
                </button>
              </>
            ) : (role !== 'admin' ? (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="btn glass-effect hover:bg-primary-foreground/20 nav-link flex items-center"
                >
                  <User className="h-5 w-5 mr-2" />
                  <span className="heading-highlight">Tài khoản</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded-lg shadow-lg z-50 py-2">
                    {accountMenu.map((item) => (
                      item.to ? (
                        <Link
                          key={item.label}
                          to={item.to}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                          onClick={() => setAccountOpen(false)}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      ) : (
                        <button
                          key={item.label}
                          onClick={() => { item.onClick && item.onClick(); setAccountOpen(false); }}
                          className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 transition-colors"
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      )
                    ))}
                  </div>
                )}
              </div>
            ) : null)}
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="mt-4 md:hidden">
          <div className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thiết bị..."
              className="input w-full rounded-r-none glass-effect"
            />
            <button
              type="submit"
              className="btn bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-l-none hover:shadow-lg hover:-translate-y-0.5"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </header>
  );
}