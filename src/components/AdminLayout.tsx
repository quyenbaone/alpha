import { BarChart2, FileText, Menu, Package, Settings, ShoppingCart, Users, X } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Footer } from './Footer';
import { Header } from './Header';

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

function SidebarItem({ icon, label, path, isActive, isSidebarOpen, badge }: SidebarItemProps) {
    return (
        <Link
            to={path}
            title={!isSidebarOpen ? label : undefined}
            className={`flex items-center p-2 rounded-md transition-all duration-200 ${isActive
                ? 'bg-blue-100 text-blue-800 font-medium shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
        >
            <div className={`flex items-center justify-center w-6 h-6 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`}>
                {icon}
            </div>
            {isSidebarOpen && (
                <div className="flex-1 flex items-center justify-between">
                    <span className="whitespace-nowrap">{label}</span>
                    {badge && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
                            {badge}
                        </span>
                    )}
                </div>
            )}
            {!isSidebarOpen && badge && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-500 text-white font-medium">
                    {badge}
                </span>
            )}
        </Link>
    );
}

interface SidebarSectionProps {
    title: string;
    isSidebarOpen: boolean;
    children: ReactNode;
}

function SidebarSection({ title, isSidebarOpen, children }: SidebarSectionProps) {
    return (
        <div className="mb-2">
            {isSidebarOpen && (
                <h3 className="text-xs uppercase font-semibold text-gray-500 px-3 mb-1">{title}</h3>
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

    // Check if screen is mobile
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        // Initial check
        checkIfMobile();

        // Add event listener
        window.addEventListener('resize', checkIfMobile);

        // Cleanup
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
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            {/* Mobile Menu Button */}
            <div className="md:hidden fixed top-24 left-4 z-50">
                <button
                    onClick={toggleMobileSidebar}
                    className="p-2 bg-white rounded-md shadow-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    {isMobileSidebarOpen ?
                        <X size={24} className="text-gray-700" /> :
                        <Menu size={24} className="text-gray-700" />
                    }
                </button>
            </div>

            <div className="flex flex-grow pt-20">
                {/* Admin Sidebar - Desktop */}
                <aside
                    className={`bg-white shadow-md z-20 transition-all duration-300 
                        ${isSidebarOpen ? 'w-64' : 'w-16'} 
                        md:block hidden fixed left-0 top-20 overflow-hidden border-r border-gray-200`}
                    style={{ maxHeight: 'calc(100vh - 7rem)' }}
                >
                    <div className="p-2 h-full flex flex-col">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="w-full mb-3 p-2 bg-gray-100 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors flex items-center justify-center flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            {isSidebarOpen ? '« Thu gọn' : '»'}
                        </button>

                        <div className="overflow-y-auto pt-1 flex-grow custom-scrollbar">
                            <SidebarSection
                                title="Tổng quan"
                                isSidebarOpen={isSidebarOpen}
                            >
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

                            <SidebarSection
                                title="Quản lý"
                                isSidebarOpen={isSidebarOpen}
                            >
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

                            <SidebarSection
                                title="Hệ thống"
                                isSidebarOpen={isSidebarOpen}
                            >
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
                            className="bg-white shadow-md z-20 w-64 fixed left-0 top-20 overflow-hidden transition-all duration-300 transform border-r border-gray-200"
                            style={{ maxHeight: 'calc(100vh - 7rem)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-3 flex flex-col h-full">
                                <div className="mb-2 flex items-center justify-between flex-shrink-0">
                                    <h3 className="font-medium text-gray-800">Admin Menu</h3>
                                    <button
                                        onClick={toggleMobileSidebar}
                                        className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
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
                                                    ? 'bg-blue-100 text-blue-800 font-medium shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}
                                                onClick={toggleMobileSidebar}
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
                                                    ? 'bg-blue-100 text-blue-800 font-medium shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}
                                                onClick={toggleMobileSidebar}
                                            >
                                                <div className="mr-3">{item.icon}</div>
                                                <span className="flex-1">{item.label}</span>
                                                {item.badge && (
                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
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
                                                    ? 'bg-blue-100 text-blue-800 font-medium shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}
                                                onClick={toggleMobileSidebar}
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

// Add this to your global CSS file
// .custom-scrollbar::-webkit-scrollbar {
//   width: 5px;
// }
// .custom-scrollbar::-webkit-scrollbar-track {
//   background: transparent;
// }
// .custom-scrollbar::-webkit-scrollbar-thumb {
//   background-color: rgba(156, 163, 175, 0.5);
//   border-radius: 3px;
// }
// .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//   background-color: rgba(156, 163, 175, 0.7);
// } 