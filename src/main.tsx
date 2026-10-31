import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with automatic updates enabled
registerSW({ immediate: true });

// Global unhandled error and rejection safety listeners
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('[Master Rummy Window Error]:', event.error || event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[Master Rummy Unhandled Promise Rejection]:', event.reason);
    // Prevent unhandled rejections from terminating the browser script execution
    event.preventDefault();
  });
}

createRoot(document.getElementById('root')!).render(<App />);
