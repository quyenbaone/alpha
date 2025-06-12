import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LoadingComponent } from './LoadingComponent';
import { ScrollToTop } from './ScrollToTop';
import { Suspense } from 'react';

export const AppWrapper = () => {
    return (
        <>
            <ScrollToTop />
            <Toaster position="top-right" theme="light" />
            <div className="min-h-screen flex flex-col bg-background">
                <main className="flex-1">
                    <Suspense fallback={<LoadingComponent />}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </>
    );
}; 