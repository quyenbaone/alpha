import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// This component scrolls to top whenever the route changes
export function ScrollToTop() {
    const { pathname } = useLocation();
    const [showButton, setShowButton] = useState(false);

    // Scroll to top on route change - make it immediate and not dependent on any conditions
    useEffect(() => {
        // Scroll to top immediately when pathname changes
        window.scrollTo(0, 0);
    }, [pathname]);

    // Show button when scrolled down
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setShowButton(true);
            } else {
                setShowButton(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            {showButton && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 group animate-fade-in flex items-center justify-center overflow-hidden"
                    aria-label="Quay lại đầu trang"
                >
                    <div className="absolute inset-0 bg-white bg-opacity-30 animate-pulse-ring rounded-full"></div>
                    <ArrowUp size={24} className="relative z-10" />
                    <span className="absolute right-full mr-2 whitespace-nowrap bg-blue-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        Về đầu trang
                    </span>
                </button>
            )}
        </>
    );
} 