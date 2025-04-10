import { Handshake, LogIn, LogOut, Search, ShoppingCart, User, UserPlus } from 'lucide-react';
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

          <nav className="flex items-center gap-6">
            {/* Shopping Cart */}
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

            {user ? (
              <>
                <Link
                  to={user.is_admin ? "/admin" : "/profile"}
                  className="btn glass-effect hover:bg-primary-foreground/20 nav-link"
                >
                  <User className="h-5 w-5 mr-2" />
                  <span className="heading-highlight">{user.is_admin ? 'Quản trị' : 'Tài khoản'}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn glass-effect hover:bg-primary-foreground/20 nav-link"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span className="heading-highlight">Đăng xuất</span>
                </button>
              </>
            ) : (
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
            )}
          </nav>
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