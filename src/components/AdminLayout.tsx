import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Footer } from './Footer';
import { Header } from './Header';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:w-64">
            <aside className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
              </div>

              {/* Sidebar Navigation */}
              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/admin"
                      className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === '/admin' ? 'bg-gray-100' : ''
                        }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/equipment"
                      className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === '/admin/equipment' ? 'bg-gray-100' : ''
                        }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Thiết bị
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/rentals"
                      className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === '/admin/rentals' ? 'bg-gray-100' : ''
                        }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      Đơn thuê
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/users"
                      className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === '/admin/users' ? 'bg-gray-100' : ''
                        }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      Người dùng
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/settings"
                      className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === '/admin/settings' ? 'bg-gray-100' : ''
                        }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Cài đặt
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main
          className={`flex-grow transition-all duration-300 
                        ${isSidebarOpen ? 'md:ml-64' : 'md:ml-16'} 
                        ml-0`}
        >
          {children}
        </main>

        <Footer />
        <Toaster position="top-right" richColors theme="light" />
      </div>
    </div>
  );
}
  