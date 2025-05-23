import {
    BarChart2, FileText, Menu, Package, Settings,
    ShoppingCart, Users, X
  } from 'lucide-react';
  import { ReactNode, useEffect, useState } from 'react';
  import { Link, useLocation } from 'react-router-dom';
  import { Toaster } from 'sonner';
  import { Footer } from './Footer';
  import { Header } from './Header';
  import { ScrollToTop } from './ScrollToTop';
  
  interface AdminLayoutProps {
    children: ReactNode;
  }
  interface SidebarItemProps {
    icon: ReactNode;
    label: string;
    path: string;
    isActive: boolean;
    isSidebarOpen: boolean;
    badge?: string | number;
  }
  
  const SidebarItem = ({ icon, label, path, isActive, isSidebarOpen, badge }: SidebarItemProps) => {
    return (
      <Link
        to={path}
        onClick={() => window.scrollTo(0, 0)}
        className={`flex items-center px-3 py-2 rounded-lg transition-all whitespace-nowrap ${isActive
          ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium'
          : 'text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
          }`}
      >
        <div className="flex-shrink-0">{icon}</div>
        <span
          className={`transition-all origin-left ${isSidebarOpen ? 'ml-3 duration-200 opacity-100' : 'w-0 ml-0 opacity-0'
            }`}
        >
          {label}
        </span>
        {badge && (
          <span
            className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 ${isSidebarOpen ? 'block' : 'hidden'
              }`}
          >
            {badge}
          </span>
        )}
      </Link>
    );
  };
  
  interface SidebarSectionProps {
    title: string;
    isSidebarOpen: boolean;
    children: ReactNode;
  }
  
  function SidebarSection({ title, isSidebarOpen, children }: SidebarSectionProps) {
    return (
      <div className="mb-2">
        {isSidebarOpen && (
          <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 px-3 mb-1">{title}</h3>
        )}
        <div className="space-y-0.5">
          {children}
        </div>
      </div>
    );
  }
  
  export function AdminLayout({ children }: AdminLayoutProps) {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
    useEffect(() => {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768);
        if (window.innerWidth < 768) {
          setIsSidebarOpen(false);
        } else {
          setIsSidebarOpen(true);
        }
      };
      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);
      return () => window.removeEventListener('resize', checkIfMobile);
    }, []);
  
    const toggleMobileSidebar = () => {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };
  
    const dashboardItems = [
      { path: '/admin', icon: <BarChart2 size={18} />, label: 'Dashboard' },
      { path: '/admin/reports', icon: <FileText size={18} />, label: 'Báo cáo' }
    ];
  
    const managementItems = [
      { path: '/admin/users', icon: <Users size={18} />, label: 'Người dùng' },
      { path: '/admin/equipment', icon: <Package size={18} />, label: 'Thiết bị' },
      { path: '/admin/rentals', icon: <ShoppingCart size={18} />, label: 'Đơn thuê' }
    ];
  
    const configItems = [
      { path: '/admin/settings', icon: <Settings size={18} />, label: 'Cài đặt' }
    ];
  
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <ScrollToTop />
        <Header />
  
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-24 left-4 z-50">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {isMobileSidebarOpen ?
              <X size={24} className="text-gray-700 dark:text-gray-300" /> :
              <Menu size={24} className="text-gray-700 dark:text-gray-300" />
            }
          </button>
        </div>
  
        <div className="flex flex-grow pt-20">
          {/* Admin Sidebar - Desktop */}
          <aside
            className={`bg-white dark:bg-gray-800 shadow-md z-20 transition-all duration-300 
                          ${isSidebarOpen ? 'w-64' : 'w-16'} 
                          md:block hidden fixed left-0 top-20 overflow-hidden border-r border-gray-200 dark:border-gray-700`}
            style={{ maxHeight: 'calc(100vh - 7rem)' }}
          >
            <div className="p-2 h-full flex flex-col">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-full mb-3 p-2 bg-gray-100 dark:bg-gray-700 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                {isSidebarOpen ? '« Thu gọn' : '»'}
              </button>
              <div className="overflow-y-auto pt-1 flex-grow custom-scrollbar">
                <SidebarSection title="Tổng quan" isSidebarOpen={isSidebarOpen}>
                  {dashboardItems.map((item) => (
                    <SidebarItem
                      key={item.path}
                      icon={item.icon}
                      label={item.label}
                      path={item.path}
                      isActive={location.pathname === item.path}
                      isSidebarOpen={isSidebarOpen}
                    />
                  ))}
                </SidebarSection>
                <SidebarSection title="Quản lý" isSidebarOpen={isSidebarOpen}>
                  {managementItems.map((item) => (
                    <SidebarItem
                      key={item.path}
                      icon={item.icon}
                      label={item.label}
                      path={item.path}
                      isActive={location.pathname === item.path}
                      isSidebarOpen={isSidebarOpen}
                      badge={item.badge}
                    />
                  ))}
                </SidebarSection>
                <SidebarSection title="Hệ thống" isSidebarOpen={isSidebarOpen}>
                  {configItems.map((item) => (
                    <SidebarItem
                      key={item.path}
                      icon={item.icon}
                      label={item.label}
                      path={item.path}
                      isActive={location.pathname === item.path}
                      isSidebarOpen={isSidebarOpen}
                    />
                  ))}
                </SidebarSection>
              </div>
            </div>
          </aside>
  
          {/* Admin Sidebar - Mobile */}
          {isMobileSidebarOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden backdrop-blur-sm" onClick={toggleMobileSidebar}>
              <aside
                className="bg-white dark:bg-gray-800 shadow-md z-20 w-64 fixed left-0 top-20 overflow-hidden transition-all duration-300 transform border-r border-gray-200 dark:border-gray-700"
                style={{ maxHeight: 'calc(100vh - 7rem)' }}
                onClick={e => e.stopPropagation()}
              >
                <div className="p-3 flex flex-col h-full">
                  <div className="mb-2 flex items-center justify-between flex-shrink-0">
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">Admin Menu</h3>
                    <button
                      onClick={toggleMobileSidebar}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="overflow-y-auto flex-grow custom-scrollbar pt-1">
                    <SidebarSection title="Tổng quan" isSidebarOpen={true}>
                      {dashboardItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center p-3 rounded-md transition-all ${location.pathname === item.path
                            ? 'bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-blue-400 font-medium shadow-sm'
                            : 'text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          onClick={(e) => {
                            toggleMobileSidebar();
                            window.scrollTo(0, 0);
                          }}
                        >
                          <div className="mr-3">{item.icon}</div>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </SidebarSection>
                    <SidebarSection title="Quản lý" isSidebarOpen={true}>
                      {managementItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center p-3 rounded-md transition-all ${location.pathname === item.path
                            ? 'bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-blue-400 font-medium shadow-sm'
                            : 'text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          onClick={(e) => {
                            toggleMobileSidebar();
                            window.scrollTo(0, 0);
                          }}
                        >
                          <div className="mr-3">{item.icon}</div>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-blue-300 font-medium">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </SidebarSection>
                    <SidebarSection title="Hệ thống" isSidebarOpen={true}>
                      {configItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center p-3 rounded-md transition-all ${location.pathname === item.path
                            ? 'bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-blue-400 font-medium shadow-sm'
                            : 'text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          onClick={(e) => {
                            toggleMobileSidebar();
                            window.scrollTo(0, 0);
                          }}
                        >
                          <div className="mr-3">{item.icon}</div>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </SidebarSection>
                  </div>
                </div>
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
        </div>
        <Footer />
        <Toaster position="top-right" richColors />
      </div>
    );
  }
  
  // Thêm vào global CSS (vd. index.css):
  /*
  .custom-scrollbar::-webkit-scrollbar {
    width: 5px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.7);
  }
  */
  