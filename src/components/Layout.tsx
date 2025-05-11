import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 pt-24">
                <Outlet />
            </main>
            <Footer />
            <Toaster position="top-right" richColors />
        </div>
    );
} 