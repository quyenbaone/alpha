import { StrictMode, startTransition } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize theme from localStorage
const initializeTheme = () => {
  // Check if user has a preference in localStorage
  const storedTheme = localStorage.getItem('theme-storage');
  if (storedTheme) {
    try {
      const themeData = JSON.parse(storedTheme);
      if (themeData.state && themeData.state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error parsing theme data:', error);
      // Fallback to system preference if error parsing stored theme
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // Use system preference as fallback if no stored preference
    document.documentElement.classList.add('dark');
    // Store the system preference
    try {
      localStorage.setItem('theme-storage', JSON.stringify({
        state: { theme: 'dark' },
        version: 0
      }));
    } catch (e) {
      console.error('Error storing theme preference:', e);
    }
  }
};

// Preload key assets
const preloadAssets = () => {
  // Add any critical assets to preload here
  // This helps with performance by loading critical resources early
  const imagesToPreload: string[] = [];
  imagesToPreload.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

// Initialize the app with performance optimizations
const initApp = () => {
  // Initialize theme before rendering
  initializeTheme();

  const container = document.getElementById('root');

  if (!container) {
    throw new Error('Root element not found');
  }

  // Start preloading assets in parallel
  preloadAssets();

  // Use createRoot for React 18 concurrent features
  const root = createRoot(container);

  // Use startTransition to wrap app rendering (helps with React Router future flags)
  const renderApp = () => {
    // Disable StrictMode in production for better performance
    if (import.meta.env.DEV) {
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    } else {
      root.render(<App />);
    }
  };

  // Wrap rendering in startTransition to be compatible with React Router's future flags
  startTransition(renderApp);
};

// Initialize the app
initApp();