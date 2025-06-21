import { BarChart2, Menu, Package, Settings, ShoppingCart, X } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Footer } from './Footer';
import { Header } from './Header';
import { ScrollToTop } from './ScrollToTop';

interface OwnerLayoutProps {
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
            className={`flex items-center rounded-md p-2 mb-1 transition-all duration-200
                ${isActive
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-medium shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
        >
            <div className="flex items-center justify-center w-8 h-8">
                {icon}
            </div>
            <span className={`ml-2 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 absolute'}`}>
                {label}
            </span>
            {badge && (
                <span className={`ml-auto px-1.5 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 absolute'}`}>
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
        <div className="mb-4">
            <h4 className={`uppercase text-xs font-medium text-gray-400 dark:text-gray-500 tracking-wider mb-2 px-3 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 absolute'}`}>
                {title}
            </h4>
            <div className="space-y-1 px-1">
                {children}
            </div>
        </div>
    );
}

export function OwnerLayout({ children }: OwnerLayoutProps) {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
            setIsSidebarOpen(window.innerWidth >= 768);
        };
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

    const dashboardItems = [
        { path: '/owner', icon: <BarChart2 size={18} />, label: 'Dashboard' }
    ];
    const managementItems = [
        { path: '/owner/equipment', icon: <Package size={18} />, label: 'Thiết bị', badge: undefined },
        { path: '/owner/rentals', icon: <ShoppingCart size={18} />, label: 'Đơn thuê', badge: undefined }
    ];
    const configItems = [
        { path: '/owner/settings', icon: <Settings size={18} />, label: 'Cài đặt' }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            <ScrollToTop />
            <Header />

            {/* Mobile Menu Button */}
            <div className="md:hidden fixed top-24 left-4 z-50">
                <button
                    onClick={toggleMobileSidebar}
                    className="p-2 bg-white dark:bg-gray-900 rounded-md shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    {isMobileSidebarOpen ?
                        <X size={24} className="text-gray-700 dark:text-gray-300" /> :
                        <Menu size={24} className="text-gray-700 dark:text-gray-300" />
                    }
                </button>
            </div>

            <div className="flex flex-grow pt-20">
                {/* Owner Sidebar - Desktop */}
                <aside
                    className={`hidden md:block fixed top-20 left-0 bottom-0 bg-white dark:bg-gray-900 shadow-md border-r border-gray-200 dark:border-gray-800 transition-all duration-300
                        ${isSidebarOpen ? 'w-64' : 'w-16'}`}
                    style={{ zIndex: 20, maxHeight: 'calc(100vh - 5rem)' }}
                >
                    <div className="flex flex-col h-full">
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

                {/* Owner Sidebar - Mobile */}
                {isMobileSidebarOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden backdrop-blur-sm" onClick={toggleMobileSidebar}>
                        <aside
                            className="bg-white dark:bg-gray-900 shadow-md z-20 w-64 fixed left-0 top-20 overflow-hidden transition-all duration-300 transform border-r border-gray-200 dark:border-gray-800"
                            style={{ maxHeight: 'calc(100vh - 7rem)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-3 flex flex-col h-full">
                                <div className="mb-2 flex items-center justify-between flex-shrink-0">
                                    <h3 className="font-medium text-gray-800 dark:text-white">Chủ sở hữu</h3>
                                    <button
                                        onClick={toggleMobileSidebar}
                                        className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="overflow-y-auto flex-grow custom-scrollbar">
                                    <SidebarSection title="Tổng quan" isSidebarOpen={true}>
                                        {dashboardItems.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`flex items-center p-3 rounded-md transition-all 
                                                    ${location.pathname === item.path
                                                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-medium shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                                onClick={() => {
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
                                                className={`flex items-center p-3 rounded-md transition-all 
                                                    ${location.pathname === item.path
                                                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-medium shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                                onClick={() => {
                                                    toggleMobileSidebar();
                                                    window.scrollTo(0, 0);
                                                }}
                                            >
                                                <div className="mr-3">{item.icon}</div>
                                                <span>{item.label}</span>
                                            </Link>
                                        ))}
                                    </SidebarSection>
                                    <SidebarSection title="Hệ thống" isSidebarOpen={true}>
                                        {configItems.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`flex items-center p-3 rounded-md transition-all 
                                                    ${location.pathname === item.path
                                                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-medium shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                                onClick={() => {
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