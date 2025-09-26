import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // The sandboxed environment has issues resolving relative paths for the service worker.
      // Constructing an absolute URL from `window.location.href` provides a reliable base
      // and ensures the browser fetches the script from the correct origin, bypassing resolution quirks.
      const swUrl = new URL('sw.js', window.location.href).href;

      const registration = await navigator.serviceWorker.register(swUrl, { scope: '/' });
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
