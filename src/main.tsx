import { StrictMode, startTransition } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

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